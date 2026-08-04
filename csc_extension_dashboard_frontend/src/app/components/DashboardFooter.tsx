import { Box, Typography, alpha } from "@mui/material";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
const socialLinks = [
  {
    label: <FaXTwitter />,
    href: "https://twitter.com/CSCegov",
    ariaLabel: "X",
  },
  {
    label: <FaFacebookF />,
    href: "https://facebook.com/CSCeGov",
    ariaLabel: "Facebook",
  },
  {
    label: <FaYoutube />,
    href: "https://youtube.com/@CSCegov",
    ariaLabel: "YouTube",
  },
  {
    label: <FaInstagram />,
    href: "https://instagram.com/CSCegov",
    ariaLabel: "Instagram",
  },
  {
    label: <FaLinkedinIn />,
    href: "https://linkedin.com/company/csc-egov",
    ariaLabel: "LinkedIn",
  },
];

interface Props {
  isDark?: boolean;
}

const GOV = {
  navy: "#0c2461",
  white: "#ffffff",
};

export default function DashboardFooter({ isDark }: Props) {
  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        px: 3,
        py: 1.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        bgcolor: isDark ? "#0b1f4d" : GOV.navy,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: "11px", color: alpha(GOV.white, 0.6) }}>
          © 2026 Ministry of Electronics & Information Technology, Government of India
        </Typography>
        <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>
        <Typography
          sx={{
            fontSize: "11px",
            color: alpha(GOV.white, 0.6),
            fontFamily: "Noto Sans Devanagari, sans-serif",
          }}
        >
          सर्वाधिकार सुरक्षित
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {["Terms of Use", "Privacy Policy", "Accessibility"].map((lbl, i, arr) => (
          <Box
            key={lbl}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                color: alpha(GOV.white, 0.6),
                cursor: "pointer",
                "&:hover": { color: GOV.white },
              }}
            >
              {lbl}
            </Typography>
            {i < arr.length - 1 && (
              <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>
                |
              </Box>
            )}
          </Box>
        ))}
        <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>

        {/* Social Media */}
        {socialLinks.map((s, i, arr) => (
          <Box key={s.ariaLabel}  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              component="a"
              href={s.href}
              aria-label={s.ariaLabel}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "13px",
                color: alpha(GOV.white, 0.6),
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": { color: "#FF9933" },
              }}
            >
              {s.label}
            </Typography>
            {i < arr.length - 1 && (
              <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>
            )}
          </Box>
        ))}
        <Box component="span" sx={{ color: alpha(GOV.white, 0.25) }}>|</Box>
        <Typography sx={{ fontSize: "11px", color: alpha(GOV.white, 0.8) }}>
          Last Updated: June 2026
        </Typography>
      </Box>
    </Box>
  );
}
