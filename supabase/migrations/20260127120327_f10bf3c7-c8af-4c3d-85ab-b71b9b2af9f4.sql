-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    total_earnings NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create gig categories enum
CREATE TYPE public.gig_category AS ENUM (
    'graphics',
    'study_guides',
    'proofreading',
    'presentations',
    'tutoring',
    'resume_design',
    'brainstorming',
    'other'
);

-- Create gigs table
CREATE TABLE public.gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_ngn NUMERIC NOT NULL CHECK (price_ngn > 0),
    delivery_days INTEGER NOT NULL CHECK (delivery_days >= 1 AND delivery_days <= 7),
    category public.gig_category NOT NULL,
    image_url TEXT,
    average_rating NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create order status enum
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'delivered',
    'cancelled'
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    status public.order_status DEFAULT 'pending' NOT NULL,
    amount_ngn NUMERIC NOT NULL,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create ratings table
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Gigs policies
CREATE POLICY "Gigs are viewable by everyone"
ON public.gigs FOR SELECT
USING (true);

CREATE POLICY "Users can create their own gigs"
ON public.gigs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gigs"
ON public.gigs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gigs"
ON public.gigs FOR DELETE
USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders as buyer or seller"
ON public.orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status"
ON public.orders FOR UPDATE
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Buyers can create ratings for their orders"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

-- Create function to update gig average rating
CREATE OR REPLACE FUNCTION public.update_gig_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.gigs
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.ratings
            WHERE gig_id = NEW.gig_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.ratings
            WHERE gig_id = NEW.gig_id
        ),
        updated_at = NOW()
    WHERE id = NEW.gig_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rating updates
CREATE TRIGGER on_rating_created
AFTER INSERT ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_gig_rating();

-- Create function to update seller earnings
CREATE OR REPLACE FUNCTION public.update_seller_earnings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
        UPDATE public.profiles
        SET 
            total_earnings = total_earnings + NEW.amount_ngn,
            updated_at = NOW()
        WHERE id = NEW.seller_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for earnings updates
CREATE TRIGGER on_order_paid
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_earnings();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for gig images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gig-images', 'gig-images', true);

-- Storage policies for gig images
CREATE POLICY "Anyone can view gig images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gig-images');

CREATE POLICY "Authenticated users can upload gig images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gig-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own gig images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gig-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own gig images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gig-images' AND auth.role() = 'authenticated');