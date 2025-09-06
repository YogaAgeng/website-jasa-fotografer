import AdminTimelineCalendar from './components/calendar/AdminTimelineCalendar.tsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-4 p-4 bg-blue-500 text-white rounded-lg">
        <h1 className="text-2xl font-bold">Photo Booking Dashboard</h1>
        
      </div>
      <AdminTimelineCalendar />
    </div>
  );
}

export default App;