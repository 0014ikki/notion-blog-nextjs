import '../styles/globals.css'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'

function MyApp({ Component, pageProps }) {
  return (
    <div className="main">
      <Navigation />
      <main className="content">
        <Component {...pageProps} />
      </main>
    </div>
  )
}

export default MyApp
