-- FlutterBox Database Schema
-- Version: 1.0.0
-- Description: Initial database setup for FlutterBox platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    github_url TEXT,
    twitter_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- =====================================================
-- WIDGETS TABLE
-- =====================================================
-- Stores Flutter widget definitions
CREATE TABLE IF NOT EXISTS public.widgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    forked_from UUID REFERENCES public.widgets(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 100),
    CONSTRAINT code_length CHECK (char_length(code) >= 10),
    CONSTRAINT valid_category CHECK (category IN (
        'buttons', 'cards', 'forms', 'navigation', 
        'lists', 'animations', 'layouts', 'other'
    ))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON public.widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_category ON public.widgets(category);
CREATE INDEX IF NOT EXISTS idx_widgets_is_public ON public.widgets(is_public);
CREATE INDEX IF NOT EXISTS idx_widgets_created_at ON public.widgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_likes_count ON public.widgets(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_views_count ON public.widgets(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_tags ON public.widgets USING GIN(tags);

-- =====================================================
-- LIKES TABLE
-- =====================================================
-- Tracks user likes on widgets
CREATE TABLE IF NOT EXISTS public.likes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    widget_id UUID REFERENCES public.widgets(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    PRIMARY KEY (user_id, widget_id)
);

-- Create indexes for likes queries
CREATE INDEX IF NOT EXISTS idx_likes_widget_id ON public.likes(widget_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
-- Stores comments on widgets
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    widget_id UUID REFERENCES public.widgets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

-- Create indexes for comments queries
CREATE INDEX IF NOT EXISTS idx_comments_widget_id ON public.comments(widget_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- =====================================================
-- WIDGET_VIEWS TABLE
-- =====================================================
-- Tracks unique widget views
CREATE TABLE IF NOT EXISTS public.widget_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    widget_id UUID REFERENCES public.widgets(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for view tracking
CREATE INDEX IF NOT EXISTS idx_widget_views_widget_id ON public.widget_views(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_views_viewer_id ON public.widget_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_widget_views_created_at ON public.widget_views(created_at DESC);

-- =====================================================
-- COLLECTIONS TABLE (Future Feature)
-- =====================================================
-- User-created collections of widgets
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- COLLECTION_WIDGETS TABLE (Future Feature)
-- =====================================================
-- Junction table for collections and widgets
CREATE TABLE IF NOT EXISTS public.collection_widgets (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
    widget_id UUID REFERENCES public.widgets(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    PRIMARY KEY (collection_id, widget_id)
);

-- =====================================================
-- NOTIFICATIONS TABLE (Future Feature)
-- =====================================================
-- User notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT valid_notification_type CHECK (type IN (
        'like', 'comment', 'follow', 'fork', 'mention', 'system'
    ))
);

-- Create index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) 
WHERE is_read = false;