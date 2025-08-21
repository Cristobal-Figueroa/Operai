export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div>
            <p className="text-sm text-center">&copy; {year} OperAI - Control de Operaciones con Drones</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
