import { BackgroundFX } from './components/BackgroundFX'
import { Nav } from './components/Nav'
import { ChatWidget } from './components/ChatWidget'
import { ChatProvider } from './context/ChatContext'
import { Hero } from './sections/Hero'
import { Stats } from './sections/Stats'
import { About } from './sections/About'
import { Experience } from './sections/Experience'
import { Expertise } from './sections/Expertise'
import { Projects } from './sections/Projects'
import { Awards } from './sections/Awards'
import { Contact } from './sections/Contact'

function App() {
  return (
    <ChatProvider>
      <BackgroundFX />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <About />
        <Experience />
        <Expertise />
        <Projects />
        <Awards />
        <Contact />
      </main>
      <ChatWidget />
    </ChatProvider>
  )
}

export default App
