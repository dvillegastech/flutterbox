-- Seed data for testing widgets in the Browse page
-- Run this in your Supabase SQL editor

-- First, ensure we have a test user (you may need to adjust the user_id)
-- Replace 'YOUR_USER_ID' with an actual user ID from your auth.users table

-- Sample widgets for testing
INSERT INTO widgets (user_id, title, description, code, category, is_public, likes_count, views_count)
VALUES 
  -- Buttons Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Gradient Button',
    'A beautiful gradient button with hover effects and ripple animation',
    'class GradientButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  
  const GradientButton({
    Key? key,
    required this.text,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue, Colors.purple],
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
        ),
        child: Text(text),
      ),
    );
  }
}',
    'buttons',
    true,
    42,
    156
  ),
  
  -- Cards Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Profile Card',
    'A clean profile card component with avatar and user details',
    'class ProfileCard extends StatelessWidget {
  final String name;
  final String role;
  final String imageUrl;
  
  const ProfileCard({
    Key? key,
    required this.name,
    required this.role,
    required this.imageUrl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundImage: NetworkImage(imageUrl),
            ),
            SizedBox(height: 12),
            Text(
              name,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              role,
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}',
    'cards',
    true,
    28,
    92
  ),
  
  -- Forms Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Custom Text Field',
    'A styled text field with validation and custom decoration',
    'class CustomTextField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? Function(String?)? validator;
  
  const CustomTextField({
    Key? key,
    required this.label,
    required this.controller,
    this.validator,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[100],
      ),
    );
  }
}',
    'forms',
    true,
    15,
    67
  ),
  
  -- Navigation Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bottom Nav Bar',
    'Custom bottom navigation bar with animated icons',
    'class CustomBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  
  const CustomBottomNav({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.shifting,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: "Home",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.search),
          label: "Search",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: "Profile",
        ),
      ],
    );
  }
}',
    'navigation',
    true,
    35,
    128
  ),
  
  -- Animations Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Pulse Animation',
    'A widget that pulses with a smooth animation effect',
    'class PulseAnimation extends StatefulWidget {
  final Widget child;
  
  const PulseAnimation({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  _PulseAnimationState createState() => _PulseAnimationState();
}

class _PulseAnimationState extends State<PulseAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);
    
    _animation = Tween<double>(
      begin: 0.95,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.scale(
          scale: _animation.value,
          child: widget.child,
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}',
    'animations',
    true,
    52,
    189
  ),
  
  -- Lists Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Todo List Item',
    'A todo list item with checkbox and swipe to delete',
    'class TodoListItem extends StatelessWidget {
  final String title;
  final bool isCompleted;
  final VoidCallback onToggle;
  final VoidCallback onDelete;
  
  const TodoListItem({
    Key? key,
    required this.title,
    required this.isCompleted,
    required this.onToggle,
    required this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: UniqueKey(),
      onDismissed: (_) => onDelete(),
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: EdgeInsets.only(right: 20),
        child: Icon(Icons.delete, color: Colors.white),
      ),
      child: ListTile(
        leading: Checkbox(
          value: isCompleted,
          onChanged: (_) => onToggle(),
        ),
        title: Text(
          title,
          style: TextStyle(
            decoration: isCompleted
                ? TextDecoration.lineThrough
                : TextDecoration.none,
          ),
        ),
      ),
    );
  }
}',
    'lists',
    true,
    23,
    87
  ),
  
  -- Layouts Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Responsive Grid',
    'A responsive grid layout that adapts to screen size',
    'class ResponsiveGrid extends StatelessWidget {
  final List<Widget> children;
  
  const ResponsiveGrid({
    Key? key,
    required this.children,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount;
        if (constraints.maxWidth < 600) {
          crossAxisCount = 2;
        } else if (constraints.maxWidth < 900) {
          crossAxisCount = 3;
        } else {
          crossAxisCount = 4;
        }
        
        return GridView.builder(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: children.length,
          itemBuilder: (context, index) => children[index],
        );
      },
    );
  }
}',
    'layouts',
    true,
    31,
    112
  ),
  
  -- Other Category
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Loading Spinner',
    'A custom loading spinner with configurable colors',
    'class LoadingSpinner extends StatelessWidget {
  final Color color;
  final double size;
  
  const LoadingSpinner({
    Key? key,
    this.color = Colors.blue,
    this.size = 50.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(color),
          strokeWidth: 3.0,
        ),
      ),
    );
  }
}',
    'other',
    true,
    18,
    76
  )
ON CONFLICT (id) DO NOTHING;