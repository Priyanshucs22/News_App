# Daily News App 📰

A modern, responsive news application built with vanilla JavaScript that provides real-time news updates from around the world.

![Daily News App](./logo.png)

## ✨ Features

- **Real-time News**: Get the latest news from trusted sources worldwide
- **Category Browsing**: Browse news by categories (Politics, Sports, Finance, Technology)
- **Country Selection**: View news from specific countries (India, USA, France, Russia)
- **Advanced Search**: Search for specific topics with real-time suggestions
- **Article Preview**: Preview articles in a beautiful modal before reading
- **Social Sharing**: Share articles on Twitter, Facebook, LinkedIn, or copy links
- **Pagination**: Navigate through multiple pages of articles
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **PWA Ready**: Progressive Web App capabilities with offline support
- **Fast Loading**: Optimized performance with lazy loading and caching

## 🚀 Live Demo

[View Live Demo](https://yourusername.github.io/daily-news-app)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: NewsAPI.org for news data
- **Icons**: Unicode emojis and custom icons
- **Fonts**: Google Fonts (Poppins)
- **Build Tools**: Node.js, Terser, CleanCSS
- **Development**: Live Server, ESLint, Prettier

## 📋 Prerequisites

Before running this project, make sure you have:

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (v14 or higher) for development
- A NewsAPI.org API key (free tier available)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/daily-news-app.git
cd daily-news-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Your API Key
1. Visit [NewsAPI.org](https://newsapi.org/register)
2. Sign up for a free account
3. Copy your API key

### 4. Configure Environment
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your API key:
   ```
   NEWS_API_KEY=your_actual_api_key_here
   ```

### 5. Update the API Key in Code
For now, update the API key directly in `script.js`:
```javascript
// In script.js, line 7
API_KEY: "your_actual_api_key_here",
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This will start a live server at `http://localhost:3000`

### Production Build
```bash
npm run build-prod
npm run serve-prod
```
This creates an optimized build in the `dist/` folder and serves it at `http://localhost:8080`

## 📱 Usage

### Basic Navigation
- **Home**: Click the logo to return to the main page
- **Categories**: Click on Politics, Sports, Finance, or Technology
- **Countries**: Hover over the country selector and choose a country
- **Search**: Type in the search box and press Enter or click Search

### Article Interaction
- **Preview**: Click on any article card to open a preview modal
- **Read Full**: Click "Read Full Article" to open the original article
- **Share**: Use the share buttons in the modal or click the share button on cards
- **Navigate**: Use pagination controls at the bottom to browse more articles

### Keyboard Shortcuts
- **Ctrl + ←/→**: Navigate between pages
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals
- **Tab**: Navigate through interactive elements

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #74c0ff;
    --secondary-color: #48c7ea;
    --background-color: #000000;
}
```

### Adding New Categories
Update the navigation in `index.html` and add corresponding handlers in `script.js`.

### Modifying API Settings
Edit the `CONFIG` object in `script.js`:
```javascript
const CONFIG = {
    API_KEY: "your_api_key",
    ARTICLES_PER_PAGE: 20,
    DEFAULT_COUNTRY: "us",
    DEFAULT_QUERY: "technology"
};
```

## 🔒 Security Features

- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **URL Validation**: External links are validated before opening
- **API Key Protection**: API key should be moved to environment variables in production
- **Content Security Policy**: Recommended headers for production deployment
- **HTTPS Only**: All external resources use HTTPS

## 📊 Performance Optimizations

- **Lazy Loading**: Images load only when needed
- **Debounced Search**: Prevents excessive API calls
- **Retry Mechanism**: Automatic retry for failed requests
- **Caching**: Browser caching for static assets
- **Minification**: CSS and JS are minified in production
- **Compression**: Gzip compression recommended for server

## 🧪 Testing

### Run Linting
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Validate HTML
```bash
npm run validate
```

### Performance Audit
```bash
npm run lighthouse
```

## 🚀 Deployment

### GitHub Pages
1. Build the project:
   ```bash
   npm run build-prod
   ```
2. Push the `dist/` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build-prod`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEWS_API_KEY` | Your NewsAPI.org API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port for development | No |

## 📝 API Limitations

### NewsAPI.org Free Tier
- 1,000 requests per day
- No commercial use
- 1-month article history
- HTTPS required for production

### Rate Limiting
The app includes built-in rate limiting and error handling to work within API constraints.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NewsAPI.org](https://newsapi.org) for providing the news data
- [FlagsAPI](https://flagsapi.com) for country flag images
- [Google Fonts](https://fonts.google.com) for the Poppins font family
- The open-source community for inspiration and tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/daily-news-app/issues) page
2. Create a new issue with detailed information
3. Contact: your.email@example.com

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Basic news browsing functionality
- Category and country filtering
- Search functionality
- Article preview modal
- Social sharing
- Responsive design
- Accessibility features
- PWA capabilities

---

**Made with ❤️ by [Your Name]**
