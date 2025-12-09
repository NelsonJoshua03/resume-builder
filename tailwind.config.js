// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: '#374151',
            a: {
              color: '#2563eb',
              textDecoration: 'underline',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            strong: {
              color: '#111827',
              fontWeight: '600',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: '#111827',
              fontWeight: '600',
            },
            h1: {
              fontSize: '2.25rem',
              marginTop: '0',
              marginBottom: '1rem',
            },
            h2: {
              fontSize: '1.875rem',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            h3: {
              fontSize: '1.5rem',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },
            code: {
              color: '#dc2626',
              backgroundColor: '#f3f4f6',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: '#3b82f6',
              fontStyle: 'italic',
              backgroundColor: '#eff6ff',
              padding: '1rem',
              borderRadius: '0.375rem',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
            },
            'thead th': {
              backgroundColor: '#f9fafb',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
            },
            'tbody tr': {
              borderBottom: '1px solid #e5e7eb',
            },
            'tbody tr:last-child': {
              borderBottom: 'none',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}