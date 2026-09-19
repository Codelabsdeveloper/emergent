import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RegistrationForm from '../components/RegistrationForm';
import WorkCarousel from '../components/WorkCarousel';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <WorkCarousel />
        <RegistrationForm />
      </main>
      <Footer />
    </div>
  );
}
