-- FlutterForge Row Level Security Policies
-- Version: 1.0.0
-- Description: RLS policies for data security and access control

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- WIDGETS POLICIES
-- =====================================================

-- Public widgets are viewable by everyone
CREATE POLICY "Public widgets are viewable by everyone" 
ON public.widgets FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Users can insert their own widgets
CREATE POLICY "Users can insert their own widgets" 
ON public.widgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own widgets
CREATE POLICY "Users can update their own widgets" 
ON public.widgets FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own widgets
CREATE POLICY "Users can delete their own widgets" 
ON public.widgets FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- LIKES POLICIES
-- =====================================================

-- Anyone can view likes
CREATE POLICY "Anyone can view likes" 
ON public.likes FOR SELECT 
USING (true);

-- Authenticated users can like widgets
CREATE POLICY "Authenticated users can like widgets" 
ON public.likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can remove their own likes" 
ON public.likes FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

-- Anyone can view comments on public widgets
CREATE POLICY "Anyone can view comments on public widgets" 
ON public.comments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.widgets 
        WHERE widgets.id = comments.widget_id 
        AND (widgets.is_public = true OR widgets.user_id = auth.uid())
    )
);

-- Authenticated users can comment on public widgets
CREATE POLICY "Authenticated users can comment on public widgets" 
ON public.comments FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.widgets 
        WHERE widgets.id = widget_id 
        AND (widgets.is_public = true OR widgets.user_id = auth.uid())
    )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- WIDGET_VIEWS POLICIES
-- =====================================================

-- Anyone can insert widget views
CREATE POLICY "Anyone can insert widget views" 
ON public.widget_views FOR INSERT 
WITH CHECK (true);

-- Widget owners can view analytics for their widgets
CREATE POLICY "Widget owners can view their widget analytics" 
ON public.widget_views FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.widgets 
        WHERE widgets.id = widget_views.widget_id 
        AND widgets.user_id = auth.uid()
    )
);

-- =====================================================
-- COLLECTIONS POLICIES
-- =====================================================

-- Public collections are viewable by everyone
CREATE POLICY "Public collections are viewable by everyone" 
ON public.collections FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Users can create their own collections
CREATE POLICY "Users can create their own collections" 
ON public.collections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update their own collections" 
ON public.collections FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete their own collections" 
ON public.collections FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- COLLECTION_WIDGETS POLICIES
-- =====================================================

-- View widgets in public collections
CREATE POLICY "View widgets in public collections" 
ON public.collection_widgets FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.collections 
        WHERE collections.id = collection_widgets.collection_id 
        AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
);

-- Users can add widgets to their own collections
CREATE POLICY "Users can add widgets to their own collections" 
ON public.collection_widgets FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.collections 
        WHERE collections.id = collection_id 
        AND collections.user_id = auth.uid()
    )
);

-- Users can remove widgets from their own collections
CREATE POLICY "Users can remove widgets from their own collections" 
ON public.collection_widgets FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.collections 
        WHERE collections.id = collection_id 
        AND collections.user_id = auth.uid()
    )
);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can only view their own notifications
CREATE POLICY "Users can only view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);