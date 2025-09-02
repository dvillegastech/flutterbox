-- FlutterBox Database Triggers
-- Version: 1.0.0
-- Description: Automated triggers for data integrity and updates

-- =====================================================
-- PROFILE CREATION TRIGGER
-- =====================================================
-- Automatically creates a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATE TIMESTAMP TRIGGERS
-- =====================================================
-- Automatically update updated_at timestamps

-- Profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Widgets table
CREATE TRIGGER update_widgets_updated_at
    BEFORE UPDATE ON public.widgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comments table
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Collections table
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- LIKES COUNT TRIGGER
-- =====================================================
-- Automatically update likes_count when likes are added/removed

-- Function to handle like addition
CREATE OR REPLACE FUNCTION handle_like_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.widgets 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.widget_id;
    
    -- Create notification for widget owner (if not self-like)
    IF (SELECT user_id FROM public.widgets WHERE id = NEW.widget_id) != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        SELECT 
            w.user_id,
            'like',
            'New like on your widget',
            p.username || ' liked your widget "' || w.title || '"',
            jsonb_build_object(
                'widget_id', NEW.widget_id,
                'liker_id', NEW.user_id,
                'liker_username', p.username
            )
        FROM public.widgets w
        JOIN public.profiles p ON p.id = NEW.user_id
        WHERE w.id = NEW.widget_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function to handle like removal
CREATE OR REPLACE FUNCTION handle_like_removed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.widgets 
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.widget_id;
    RETURN OLD;
END;
$$;

-- Trigger for like addition
CREATE TRIGGER on_like_added
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION handle_like_added();

-- Trigger for like removal
CREATE TRIGGER on_like_removed
    AFTER DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION handle_like_removed();

-- =====================================================
-- COMMENT NOTIFICATION TRIGGER
-- =====================================================
-- Send notification when someone comments on a widget

CREATE OR REPLACE FUNCTION handle_new_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create notification for widget owner (if not self-comment)
    IF (SELECT user_id FROM public.widgets WHERE id = NEW.widget_id) != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        SELECT 
            w.user_id,
            'comment',
            'New comment on your widget',
            p.username || ' commented on your widget "' || w.title || '"',
            jsonb_build_object(
                'widget_id', NEW.widget_id,
                'comment_id', NEW.id,
                'commenter_id', NEW.user_id,
                'commenter_username', p.username,
                'comment_preview', LEFT(NEW.content, 100)
            )
        FROM public.widgets w
        JOIN public.profiles p ON p.id = NEW.user_id
        WHERE w.id = NEW.widget_id;
    END IF;
    
    -- If this is a reply, notify the parent comment author
    IF NEW.parent_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        SELECT 
            c.user_id,
            'comment',
            'New reply to your comment',
            p.username || ' replied to your comment',
            jsonb_build_object(
                'widget_id', NEW.widget_id,
                'comment_id', NEW.id,
                'parent_comment_id', NEW.parent_id,
                'replier_id', NEW.user_id,
                'replier_username', p.username,
                'reply_preview', LEFT(NEW.content, 100)
            )
        FROM public.comments c
        JOIN public.profiles p ON p.id = NEW.user_id
        WHERE c.id = NEW.parent_id
        AND c.user_id != NEW.user_id; -- Don't notify if replying to own comment
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_added
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION handle_new_comment();

-- =====================================================
-- FORK NOTIFICATION TRIGGER
-- =====================================================
-- Send notification when someone forks a widget

CREATE OR REPLACE FUNCTION handle_widget_forked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only if widget has forked_from field
    IF NEW.forked_from IS NOT NULL THEN
        -- Update fork count on original widget
        UPDATE public.widgets 
        SET forks_count = forks_count + 1 
        WHERE id = NEW.forked_from;
        
        -- Create notification for original widget owner
        INSERT INTO public.notifications (user_id, type, title, message, data)
        SELECT 
            w.user_id,
            'fork',
            'Your widget was forked',
            p.username || ' forked your widget "' || w.title || '"',
            jsonb_build_object(
                'original_widget_id', NEW.forked_from,
                'forked_widget_id', NEW.id,
                'forker_id', NEW.user_id,
                'forker_username', p.username
            )
        FROM public.widgets w
        JOIN public.profiles p ON p.id = NEW.user_id
        WHERE w.id = NEW.forked_from
        AND w.user_id != NEW.user_id; -- Don't notify if forking own widget
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_widget_forked
    AFTER INSERT ON public.widgets
    FOR EACH ROW EXECUTE FUNCTION handle_widget_forked();

-- =====================================================
-- USERNAME VALIDATION TRIGGER
-- =====================================================
-- Ensure username is unique and properly formatted

CREATE OR REPLACE FUNCTION validate_username()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Convert username to lowercase
    NEW.username = LOWER(NEW.username);
    
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE username = NEW.username 
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Username % is already taken', NEW.username;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_username_trigger
    BEFORE INSERT OR UPDATE OF username ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION validate_username();

-- =====================================================
-- WIDGET VIEW TRACKING TRIGGER
-- =====================================================
-- Track unique views (one per user per day)

CREATE OR REPLACE FUNCTION track_widget_view()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if this user already viewed this widget today
    IF NOT EXISTS (
        SELECT 1 FROM public.widget_views
        WHERE widget_id = NEW.widget_id
        AND viewer_id = NEW.viewer_id
        AND DATE(created_at) = CURRENT_DATE
    ) THEN
        -- Increment view count
        UPDATE public.widgets 
        SET views_count = views_count + 1 
        WHERE id = NEW.widget_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_widget_view_tracked
    BEFORE INSERT ON public.widget_views
    FOR EACH ROW EXECUTE FUNCTION track_widget_view();