import Navbar from "@/components/Navbar"
import "@/pages/globals.css"

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  )
}

export default App
