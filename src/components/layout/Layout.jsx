import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container px-4 py-6" style={{ margin: '10px auto' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
