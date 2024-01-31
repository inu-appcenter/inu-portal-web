import Header from '../Header/Header'
import Nav from '../Banner/Banner'
import Notice from '../Notice/Notice'
import Section from '../Section/Section'

export default function Main(){
  return (
    <>
    <header>
      <Header/>
    </header>
    <main>
      <Nav></Nav>
      <Section></Section>
      <Notice></Notice>
    </main> 
    </>
  )
}


