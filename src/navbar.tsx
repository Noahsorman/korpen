import { Link, useLocation } from 'react-router-dom';
import { Users, Trophy, BookOpenCheck, CirclePile  } from 'lucide-react'; // Installera med: npm install lucide-react

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Mitt Lag', icon: <CirclePile size={20} /> },
    { path: '/league', label: 'Ligan', icon: <Trophy size={20} /> },
    { path: '/players', label: 'Spelare', icon: <Users size={20} /> },
    { path: '/rules', label: 'Regler', icon: <BookOpenCheck size={20} /> },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: '#101010',
        borderTop: '1px solid #1a1a1a',
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;