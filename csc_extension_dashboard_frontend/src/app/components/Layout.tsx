import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';

/* ── MUI core ─────────────────────────────────────────────────── */
import { styled, alpha } from '@mui/material/styles';
import AppBar        from '@mui/material/AppBar';
import Box           from '@mui/material/Box';
import Toolbar       from '@mui/material/Toolbar';
import IconButton    from '@mui/material/IconButton';
import Typography    from '@mui/material/Typography';
import InputBase     from '@mui/material/InputBase';
import Badge         from '@mui/material/Badge';
import MenuItem      from '@mui/material/MenuItem';
import Menu          from '@mui/material/Menu';
import Divider       from '@mui/material/Divider';
import Avatar        from '@mui/material/Avatar';
import Tabs          from '@mui/material/Tabs';
import Tab           from '@mui/material/Tab';

/* ── MUI icons ────────────────────────────────────────────────── */
import SearchIcon        from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon          from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon        from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PhoneIcon         from '@mui/icons-material/Phone';

/* ── Lucide (for tab icons only) ──────────────────────────────── */
import {
  LayoutDashboard, BarChart2, AlertTriangle, Cpu, Users, Bell,
  Grid3x3, FileText, Settings,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   COLOUR TOKENS  (government palette)
════════════════════════════════════════════════════════════════ */
const GOV = {
  navy:    '#0c2461',   // utility bar / deepest blue
  blue:    '#1a4592',   // nav bar / primary
  saffron: '#FF9933',   // indicator / badge / accent
  green:   '#138808',   // status / positive
  white:   '#ffffff',
  contentBg: '#eef2f7',
};

/* ════════════════════════════════════════════════════════════════
   STYLED COMPONENTS  (mirroring the MUI AppBar template pattern)
════════════════════════════════════════════════════════════════ */

/** Frosted search box — works on the white AppBar */
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(GOV.blue, 0.07),
  border: `1px solid ${alpha(GOV.blue, 0.18)}`,
  '&:hover': {
    backgroundColor: alpha(GOV.blue, 0.12),
    borderColor: alpha(GOV.blue, 0.35),
  },
  '&:focus-within': {
    backgroundColor: GOV.white,
    borderColor: GOV.blue,
    boxShadow: `0 0 0 2px ${alpha(GOV.blue, 0.15)}`,
  },
  marginRight: theme.spacing(2),
  marginLeft:  theme.spacing(3),
  width: 'auto',
  transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(GOV.blue, 0.55),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: GOV.navy,
  fontSize: '13px',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.85, 1, 0.85, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3.5)})`,
    transition: theme.transitions.create('width'),
    width: '16ch',
    '&::placeholder': { color: alpha(GOV.navy, 0.45) },
    [theme.breakpoints.up('md')]: { width: '22ch' },
  },
}));

/* ════════════════════════════════════════════════════════════════
   NAV ITEMS
════════════════════════════════════════════════════════════════ */
const navItems = [
  { path: '/',               icon: LayoutDashboard, label: 'Dashboard',      exact: true },
  { path: '/analytics',      icon: BarChart2,        label: 'Analytics'                   },
  { path: '/rejections',     icon: AlertTriangle,    label: 'Rejections'                  },
  { path: '/ai-performance', icon: Cpu,              label: 'AI Performance'              },
  { path: '/operators',      icon: Users,            label: 'CSC Operators'               },
  { path: '/notifications',  icon: Bell,             label: 'Notifications'               },
  { path: '/services',       icon: Grid3x3,          label: 'Services'                    },
  { path: '/logs',           icon: FileText,         label: 'System Logs'                 },
  { path: '/settings',       icon: Settings,         label: 'Settings'                    },
];

function a11yProps(index: number) {
  return { id: `gov-tab-${index}`, 'aria-controls': `gov-tabpanel-${index}` };
}

/* ════════════════════════════════════════════════════════════════
   GOVERNMENT NATIONAL EMBLEM
════════════════════════════════════════════════════════════════ */
const NationalEmblem = () => (
  <svg viewBox="0 0 64 64" width="44" height="44" aria-label="National Emblem of India">
    <circle cx="32" cy="32" r="31" fill={GOV.white} stroke={GOV.saffron} strokeWidth="2.2"/>
    <circle cx="32" cy="32" r="27.5" fill={GOV.white} stroke={GOV.blue}   strokeWidth="0.6"/>
    <ellipse cx="32" cy="17" rx="4.5" ry="5.5" fill={GOV.blue}/>
    <rect x="29" y="21" width="6" height="4" rx="1" fill={GOV.blue}/>
    <ellipse cx="21" cy="19" rx="3.5" ry="4.5" fill={GOV.blue}/>
    <rect x="18.5" y="22.5" width="5" height="3.5" rx="1" fill={GOV.blue}/>
    <ellipse cx="43" cy="19" rx="3.5" ry="4.5" fill={GOV.blue}/>
    <rect x="40.5" y="22.5" width="5" height="3.5" rx="1" fill={GOV.blue}/>
    <rect x="15" y="26.5" width="34" height="3.5" rx="1.5" fill={GOV.blue}/>
    <circle cx="32" cy="39" r="8.5" fill="none" stroke={GOV.saffron} strokeWidth="1.8"/>
    <circle cx="32" cy="39" r="2.2" fill={GOV.saffron}/>
    {Array.from({ length: 24 }).map((_, i) => {
      const a = (i * 15 * Math.PI) / 180;
      return (
        <line key={`sp-${i}`}
          x1={32 + 2.2 * Math.cos(a)} y1={39 + 2.2 * Math.sin(a)}
          x2={32 + 8.5 * Math.cos(a)} y2={39 + 8.5 * Math.sin(a)}
          stroke={GOV.saffron} strokeWidth="0.8"
        />
      );
    })}
    <text x="32" y="57.5" textAnchor="middle" fill={GOV.blue} fontSize="4.8"
      fontWeight="700" fontFamily="Noto Sans Devanagari, Inter, sans-serif">
      सत्यमेव जयते
    </text>
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   MUI TABS  sx  (government blue bar)
════════════════════════════════════════════════════════════════ */
const tabsSx = {
  flex: 1,
  minHeight: '46px',
  '& .MuiTabs-indicator': {
    backgroundColor: GOV.saffron,
    height: '3px',
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTabs-scrollButtons': {
    color: alpha(GOV.white, 0.75),
    '&.Mui-disabled': { opacity: 0.3 },
  },
  '& .MuiTab-root': {
    color: alpha(GOV.white, 0.78),
    minHeight: '46px',
    px: '14px',
    textTransform: 'none',
    fontSize: '13px',
    fontFamily: 'Inter, Noto Sans Devanagari, sans-serif',
    fontWeight: 400,
    letterSpacing: '0.01em',
    transition: 'background-color 0.18s, color 0.18s',
    '& .MuiTab-iconWrapper': { color: alpha(GOV.white, 0.60), mb: '0 !important', mr: '6px' },
    '&:hover': {
      color: GOV.white,
      backgroundColor: alpha(GOV.white, 0.09),
      '& .MuiTab-iconWrapper': { color: alpha(GOV.white, 0.9) },
    },
    '&.Mui-selected': {
      color: GOV.white,
      fontWeight: 600,
      backgroundColor: alpha('#000', 0.24),
      '& .MuiTab-iconWrapper': { color: GOV.saffron },
    },
  },
};

/* ════════════════════════════════════════════════════════════════
   LAYOUT COMPONENT
════════════════════════════════════════════════════════════════ */
export default function Layout() {
  const navigate  = useNavigate();
  const location  = useLocation();

  /* Profile dropdown */
  const [anchorEl,       setAnchorEl]       = useState<null | HTMLElement>(null);
  /* Mobile overflow menu */
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen       = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileAnchorEl);

  const handleProfileOpen  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);
  const handleMobileOpen   = (e: React.MouseEvent<HTMLElement>) => setMobileAnchorEl(e.currentTarget);
  const handleMobileClose  = () => setMobileAnchorEl(null);

  /* Active tab */
  const currentTab = useMemo(() => {
    const idx = navItems.findIndex(item =>
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return idx === -1 ? false : idx;
  }, [location.pathname]);

  const handleTabChange = (_: React.SyntheticEvent, v: number) => navigate(navItems[v].path);

  /* ── Profile desktop menu ── */
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top',    horizontal: 'right' }}
      id="profile-menu"
      keepMounted
      open={isMenuOpen}
      onClose={handleProfileClose}
      slotProps={{
        paper: {
          elevation: 4,
          sx: {
            mt: 1,
            minWidth: 200,
            borderTop: `3px solid ${GOV.saffron}`,
            '& .MuiMenuItem-root': { fontSize: '13px', py: 1.2, gap: 1.5 },
          },
        },
      }}
    >
      {/* Mini profile card */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0', mb: 0.5 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: GOV.navy }}>Admin User</Typography>
        <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>District Officer · MeitY</Typography>
      </Box>
      <MenuItem onClick={handleProfileClose} sx={{ color: GOV.navy }}>
        <ManageAccountsIcon sx={{ fontSize: 18, color: GOV.blue }} />
        My Profile
      </MenuItem>
      <MenuItem onClick={handleProfileClose} sx={{ color: GOV.navy }}>
        <AccountCircleIcon sx={{ fontSize: 18, color: GOV.blue }} />
        Account Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleProfileClose} sx={{ color: '#dc2626' }}>
        <LogoutIcon sx={{ fontSize: 18, color: '#dc2626' }} />
        Sign Out
      </MenuItem>
    </Menu>
  );

  /* ── Mobile overflow menu ── */
  const mobileMenu = (
    <Menu
      anchorEl={mobileAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="mobile-menu"
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMobileClose}
      slotProps={{
        paper: {
          sx: { mt: 1, minWidth: 180, borderTop: `3px solid ${GOV.saffron}` },
        },
      }}
    >
      <MenuItem onClick={handleMobileClose}>
        <IconButton size="small" sx={{ color: GOV.blue, mr: 1 }}>
          <Badge badgeContent={7} sx={{ '& .MuiBadge-badge': { bgcolor: GOV.saffron, color: GOV.white, fontSize: '10px' } }}>
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>
        <Typography fontSize="13px">Notifications</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleMobileClose(); handleProfileOpen({ currentTarget: mobileAnchorEl! } as any); }}>
        <IconButton size="small" sx={{ color: GOV.blue, mr: 1 }}>
          <AccountCircleIcon fontSize="small" />
        </IconButton>
        <Typography fontSize="13px">Profile</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleMobileClose} sx={{ color: '#dc2626' }}>
        <IconButton size="small" sx={{ color: '#dc2626', mr: 1 }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
        <Typography fontSize="13px">Sign Out</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      fontFamily: 'Inter, Noto Sans Devanagari, sans-serif', bgcolor: GOV.contentBg }}>

      {/* ══ ROW 1 — Utility Bar ══════════════════════════════════ */}
      <Box
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300,
          bgcolor: GOV.navy, height: '34px',
          display: 'flex', alignItems: 'center', px: 2, gap: 1,
        }}
      >
        {/* Language */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: alpha(GOV.white, 0.75), fontSize: '12px' }}>
          <Box component="span" sx={{ color: GOV.white, fontWeight: 600, fontFamily: 'Noto Sans Devanagari, sans-serif' }}>अ</Box>
          <Box component="span" sx={{ color: alpha(GOV.white, 0.3), mx: 0.5 }}>|</Box>
          <Box component="span">A</Box>
          <Box component="span" sx={{ color: alpha(GOV.white, 0.3), mx: 0.5 }}>|</Box>
          <Box component="span">Select Language</Box>
          <Box component="span" sx={{ color: alpha(GOV.white, 0.3), mx: 0.5 }}>|</Box>
          <Box component="span" sx={{ color: GOV.white, fontFamily: 'Noto Sans Devanagari, sans-serif' }}>हिन्दी</Box>
        </Box>
        {/* Helpline */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5, color: alpha(GOV.white, 0.65), fontSize: '12px', ml: 1 }}>
          <PhoneIcon sx={{ fontSize: 12 }}/>
          <span>1800-121-3468</span>
        </Box>
        <Box sx={{ flexGrow: 1 }}/>
        {/* Login links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, fontSize: '12px', color: alpha(GOV.white, 0.78) }}>
          {['Citizen Login', 'Government Login', 'LSK Login', 'eDM Login'].map((lbl, i, arr) => (
            <Box key={lbl} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="button" sx={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', p: 0,
                '&:hover': { color: GOV.white } }}>
                {lbl}
              </Box>
              {i < arr.length - 1 && <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ ROW 2 — MUI AppBar ═══════════════════════════════════ */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: '34px',
          zIndex: 1200,
          bgcolor: GOV.white,
          color: GOV.navy,
          borderBottom: `4px solid ${GOV.saffron}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1.5, sm: 2 }, gap: 1 }}>

          {/* Logo / Emblem */}
          <IconButton edge="start" disableRipple sx={{ p: 0.5, mr: 1, '&:hover': { bgcolor: 'transparent' } }}>
            <NationalEmblem />
          </IconButton>

          {/* Title block */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.3,
              fontFamily: 'Noto Sans Devanagari, Inter, sans-serif' }}>
              भारत सरकार · Government of India · MeitY · CSC e-Governance
            </Typography>
            <Typography noWrap sx={{ fontSize: '15px', fontWeight: 700, color: GOV.navy, lineHeight: 1.3 }}>
              CSC AI Co-Pilot Monitoring Dashboard
            </Typography>
          </Box>

          {/* Styled Search (template pattern) */}
          <Search sx={{ display: { xs: 'none', md: 'block' }, ml: 3 }}>
            <SearchIconWrapper>
              <SearchIcon sx={{ fontSize: 18 }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search applications, operators…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          {/* ── Desktop right icons ── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {/* Notifications */}
            <IconButton
              size="large"
              aria-label="show 7 new notifications"
              sx={{ color: GOV.blue, '&:hover': { bgcolor: alpha(GOV.blue, 0.06) } }}
            >
              <Badge
                badgeContent={7}
                sx={{ '& .MuiBadge-badge': { bgcolor: GOV.saffron, color: GOV.white, fontSize: '10px', minWidth: 16, height: 16 } }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile avatar button */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileOpen}
              sx={{ color: GOV.blue, '&:hover': { bgcolor: alpha(GOV.blue, 0.06) }, gap: 1, pl: 1, pr: 1.5, borderRadius: '8px' }}
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: GOV.blue, border: `2px solid ${GOV.saffron}`, fontSize: '12px', fontWeight: 700 }}
              >
                AD
              </Avatar>
              <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: GOV.navy, lineHeight: 1.2 }}>Admin</Typography>
                <Typography sx={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.2 }}>District Officer</Typography>
              </Box>
            </IconButton>
          </Box>

          {/* ── Mobile: MoreVert ── */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="mobile-menu"
              aria-haspopup="true"
              onClick={handleMobileOpen}
              sx={{ color: GOV.blue }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Menus (rendered outside AppBar, same as template) ── */}
      {mobileMenu}
      {profileMenu}

      {/* ══ ROW 3 — MUI Tabs Nav Bar ═════════════════════════════ */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: '98px',
          left: 0, right: 0,
          zIndex: 1100,
          bgcolor: GOV.blue,
          boxShadow: '0 3px 8px rgba(0,0,0,0.22)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Government Dashboard Navigation"
          sx={tabsSx}
        >
          {navItems.map((item, i) => (
            <Tab
              key={item.path}
              icon={<item.icon size={14} />}
              iconPosition="start"
              label={item.label}
              {...a11yProps(i)}
            />
          ))}
        </Tabs>

        {/* Live status chip */}
        <Box sx={{
          px: 2, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
          height: '46px', borderLeft: `1px solid ${alpha(GOV.white, 0.15)}`,
        }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80',
            '@keyframes govpulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
            animation: 'govpulse 2s ease-in-out infinite',
          }}/>
          <Box component="span" sx={{ fontSize: '11px', color: alpha(GOV.white, 0.70), whiteSpace: 'nowrap',
            display: { xs: 'none', lg: 'block' } }}>
            All Services Operational
          </Box>
        </Box>
      </Box>

      {/* ══ MAIN CONTENT ════════════════════════════════════════ */}
      <Box
        component="main"
        sx={{ flexGrow: 1, overflow: 'auto', mt: '144px', bgcolor: GOV.contentBg }}
      >
        {/* Tricolor banner stripe */}
        <Box sx={{ display: 'flex', height: '5px' }}>
          <Box sx={{ flex: 1, bgcolor: GOV.saffron }} />
          <Box sx={{ flex: 1, bgcolor: GOV.white  }} />
          <Box sx={{ flex: 1, bgcolor: GOV.green  }} />
        </Box>
        <Outlet />
      </Box>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <Box
        component="footer"
        sx={{
          flexShrink: 0, px: 3, py: 1.5,
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1,
          bgcolor: GOV.navy,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '11px', color: alpha(GOV.white, 0.60) }}>
            © 2026 Ministry of Electronics & Information Technology, Government of India
          </Typography>
          <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>
          <Typography sx={{ fontSize: '11px', color: alpha(GOV.white, 0.60), fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
            सर्वाधिकार सुरक्षित
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {['Terms of Use', 'Privacy Policy', 'Accessibility'].map((lbl, i, arr) => (
            <Box key={lbl} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '11px', color: alpha(GOV.white, 0.60), cursor: 'pointer',
                '&:hover': { color: GOV.white } }}>{lbl}</Typography>
              {i < arr.length - 1 && <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>}
            </Box>
          ))}
          <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>
          <Typography sx={{ fontSize: '11px', color: alpha(GOV.white, 0.80) }}>Last Updated: March 2026</Typography>
        </Box>
      </Box>
    </Box>
  );
}
