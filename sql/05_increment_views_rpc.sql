-- Función RPC para incrementar el contador de vistas
CREATE OR REPLACE FUNCTION increment_view_count(widget_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE widgets 
  SET views_count = views_count + 1 
  WHERE id = widget_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;