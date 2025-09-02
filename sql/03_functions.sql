-- FlutterBox Database Functions
-- Version: 1.0.0
-- Description: Utility functions and stored procedures

-- =====================================================
-- INCREMENT VIEW COUNT FUNCTION
-- =====================================================
-- Increments the view count for a widget
CREATE OR REPLACE FUNCTION increment_view_count(widget_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.widgets 
    SET views_count = views_count + 1 
    WHERE id = widget_id;
END;
$$;

-- =====================================================
-- UPDATE LIKES COUNT FUNCTION
-- =====================================================
-- Updates the likes count for a widget based on actual likes
CREATE OR REPLACE FUNCTION update_likes_count(widget_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.widgets 
    SET likes_count = (
        SELECT COUNT(*) 
        FROM public.likes 
        WHERE likes.widget_id = update_likes_count.widget_id
    )
    WHERE id = widget_id;
END;
$$;

-- =====================================================
-- CREATE PROFILE FOR NEW USER
-- =====================================================
-- Automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', NULL)
    );
    RETURN new;
END;
$$;

-- =====================================================
-- UPDATE UPDATED_AT TIMESTAMP
-- =====================================================
-- Automatically updates the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- =====================================================
-- SEARCH WIDGETS FUNCTION
-- =====================================================
-- Full-text search for widgets
CREATE OR REPLACE FUNCTION search_widgets(search_query TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    description TEXT,
    code TEXT,
    category TEXT,
    tags TEXT[],
    likes_count INTEGER,
    views_count INTEGER,
    is_public BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.user_id,
        w.title,
        w.description,
        w.code,
        w.category,
        w.tags,
        w.likes_count,
        w.views_count,
        w.is_public,
        w.created_at,
        ts_rank(
            to_tsvector('english', COALESCE(w.title, '') || ' ' || COALESCE(w.description, '')),
            plainto_tsquery('english', search_query)
        ) AS relevance
    FROM public.widgets w
    WHERE 
        w.is_public = true AND (
            w.title ILIKE '%' || search_query || '%' OR
            w.description ILIKE '%' || search_query || '%' OR
            search_query = ANY(w.tags)
        )
    ORDER BY relevance DESC, w.created_at DESC;
END;
$$;

-- =====================================================
-- GET WIDGET STATISTICS
-- =====================================================
-- Returns statistics for a specific widget
CREATE OR REPLACE FUNCTION get_widget_stats(widget_id UUID)
RETURNS TABLE (
    total_views INTEGER,
    total_likes INTEGER,
    total_comments INTEGER,
    total_forks INTEGER,
    unique_viewers INTEGER,
    daily_views JSON,
    daily_likes JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT views_count FROM public.widgets WHERE id = widget_id) AS total_views,
        (SELECT COUNT(*)::INTEGER FROM public.likes WHERE likes.widget_id = get_widget_stats.widget_id) AS total_likes,
        (SELECT COUNT(*)::INTEGER FROM public.comments WHERE comments.widget_id = get_widget_stats.widget_id) AS total_comments,
        (SELECT COUNT(*)::INTEGER FROM public.widgets WHERE forked_from = widget_id) AS total_forks,
        (SELECT COUNT(DISTINCT viewer_id)::INTEGER FROM public.widget_views WHERE widget_views.widget_id = get_widget_stats.widget_id) AS unique_viewers,
        (
            SELECT json_agg(daily_data)
            FROM (
                SELECT 
                    DATE(created_at) AS date,
                    COUNT(*) AS views
                FROM public.widget_views
                WHERE widget_views.widget_id = get_widget_stats.widget_id
                AND created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY date
            ) daily_data
        ) AS daily_views,
        (
            SELECT json_agg(daily_data)
            FROM (
                SELECT 
                    DATE(created_at) AS date,
                    COUNT(*) AS likes
                FROM public.likes
                WHERE likes.widget_id = get_widget_stats.widget_id
                AND created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY date
            ) daily_data
        ) AS daily_likes;
END;
$$;

-- =====================================================
-- GET USER STATISTICS
-- =====================================================
-- Returns statistics for a specific user
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
    total_widgets INTEGER,
    total_likes_received INTEGER,
    total_views INTEGER,
    total_comments_received INTEGER,
    total_followers INTEGER,
    total_following INTEGER,
    popular_widgets JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM public.widgets WHERE widgets.user_id = get_user_stats.user_id) AS total_widgets,
        (
            SELECT COUNT(*)::INTEGER 
            FROM public.likes l
            JOIN public.widgets w ON l.widget_id = w.id
            WHERE w.user_id = get_user_stats.user_id
        ) AS total_likes_received,
        (
            SELECT COALESCE(SUM(views_count), 0)::INTEGER 
            FROM public.widgets 
            WHERE widgets.user_id = get_user_stats.user_id
        ) AS total_views,
        (
            SELECT COUNT(*)::INTEGER 
            FROM public.comments c
            JOIN public.widgets w ON c.widget_id = w.id
            WHERE w.user_id = get_user_stats.user_id
        ) AS total_comments_received,
        0::INTEGER AS total_followers, -- Placeholder for future feature
        0::INTEGER AS total_following, -- Placeholder for future feature
        (
            SELECT json_agg(widget_data)
            FROM (
                SELECT 
                    id,
                    title,
                    likes_count,
                    views_count
                FROM public.widgets
                WHERE widgets.user_id = get_user_stats.user_id
                ORDER BY likes_count DESC
                LIMIT 5
            ) widget_data
        ) AS popular_widgets;
END;
$$;

-- =====================================================
-- FORK WIDGET FUNCTION
-- =====================================================
-- Creates a copy of a widget for a user
CREATE OR REPLACE FUNCTION fork_widget(
    source_widget_id UUID,
    forking_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_widget_id UUID;
BEGIN
    INSERT INTO public.widgets (
        user_id,
        title,
        description,
        code,
        category,
        tags,
        is_public,
        forked_from
    )
    SELECT
        forking_user_id,
        title || ' (Fork)',
        description,
        code,
        category,
        tags,
        false, -- Start as private
        source_widget_id
    FROM public.widgets
    WHERE id = source_widget_id
    RETURNING id INTO new_widget_id;
    
    -- Update fork count on original widget
    UPDATE public.widgets 
    SET forks_count = forks_count + 1 
    WHERE id = source_widget_id;
    
    RETURN new_widget_id;
END;
$$;

-- =====================================================
-- CLEANUP OLD NOTIFICATIONS
-- =====================================================
-- Removes notifications older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
END;
$$;