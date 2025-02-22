import { red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createTheme({
	palette: {
		primary: {
			main: '#556cd6'
			//   main: '#00695f',
			//   main: '#ffc107',
			//   main: 'rgb(44, 19, 56)',
		},
		secondary: {
			main: '#7c88cc'
			//   main: '#009688',
			//   main: '#ffcd38',
		},
		menuItem: {
			color: '#2979ff',
		},
		error: {
			main: red.A400
		},
		background: {
			default: 'rgb(254, 249, 248)'
		},
		breadcrumbItem: {
			fontSize: '12px',
			fontWeight: '500',
			textTransform: 'uppercase'
		},
		breadcrumbLink: {
			color: 'inherit',
			textDecoration: 'none',
			textTransform: 'uppercase',
			fontSize: '12px',
			'&:hover': {
				textDecoration: 'underline'
			}
		}
	}
});

export default theme;
