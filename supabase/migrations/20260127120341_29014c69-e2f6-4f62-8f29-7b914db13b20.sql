-- Fix function search path for update_gig_rating
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix function search path for update_seller_earnings
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix function search path for handle_new_user
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;