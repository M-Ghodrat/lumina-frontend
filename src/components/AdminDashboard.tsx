import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { auth } from '../firebase';
import { Appointment, Inquiry, Service } from '../types';
import { 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Check, 
  Trash2, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { SERVICES } from '../constants';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type DateFilterType = 'today' | 'yesterday' | 'last-week' | 'last-month' | 'last-year' | 'all';

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterType>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calendar Navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch data via backend API
  const loadAdminData = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      // 1. Fetch appointments from backend API
      const fetchedAppoints = await api.getAppointments();
      setAppointments(fetchedAppoints);

      // 2. Fetch inquiries from backend API
      const fetchedInquiries = await api.getInquiries();
      setInquiries(fetchedInquiries);

      // 3. Fetch services from backend API
      const fetchedServices = await api.getServices();
      if (fetchedServices && fetchedServices.length > 0) {
        setServices(fetchedServices);
      }
    } catch (err: any) {
      console.error("Admin API retrieval failure:", err);
      setError(err.message || "Failed to load database from backend server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  // Handle status update of appointment via backend API
  const updateAppointmentStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      
      // Update local state
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    } catch (err: any) {
      console.error("Error updating appointment status via API:", err);
      setError("Failed to update status: " + err.message);
    }
  };

  // Delete Inquiry via backend API
  const removeInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this client inquiry?")) return;
    try {
      await api.deleteInquiry(id);
      setInquiries(prev => prev.filter(inq => inq.id !== id));
    } catch (err: any) {
      console.error("Inquiry deletion failure via API:", err);
      setError("Error deleting record: " + err.message);
    }
  };

  // Helper: Find service cost
  const getServicePrice = (serviceId: string) => {
    const s = services.find(item => item.name.toLowerCase() === serviceId.toLowerCase());
    return s ? s.price : 90; // Fallback standard pricing
  };

  const getServiceDuration = (serviceId: string) => {
    const s = services.find(item => item.name.toLowerCase() === serviceId.toLowerCase());
    return s ? s.duration : 60;
  };

  // Dynamic Date parsing checks
  const getLocalDateTime = (firebaseTimestamp: any) => {
    if (!firebaseTimestamp) return new Date();
    if (firebaseTimestamp.toDate) return firebaseTimestamp.toDate();
    if (firebaseTimestamp.seconds) return new Date(firebaseTimestamp.seconds * 1000);
    return new Date(firebaseTimestamp);
  };

  // Filter lists based on selected period & selected date
  const filterByPeriod = <T extends { date?: string; createdAt?: any }>(item: T): boolean => {
    let itemDate = new Date();
    if (item.date) {
      const [y, m, d] = item.date.split('-').map(Number);
      itemDate = new Date(y, m - 1, d);
    } else if (item.createdAt) {
      itemDate = getLocalDateTime(item.createdAt);
    } else {
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = new Date(itemDate);
    checkDate.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    switch (selectedPeriod) {
      case 'today':
        return checkDate.getTime() === today.getTime();
      case 'yesterday':
        return checkDate.getTime() === yesterday.getTime();
      case 'last-week':
        return checkDate >= oneWeekAgo;
      case 'last-month':
        return checkDate >= oneMonthAgo;
      case 'last-year':
        return checkDate >= oneYearAgo;
      case 'all':
      default:
        return true;
    }
  };

  // Filters combined with search and specific date tap
  const processedAppointments = appointments
    .filter(filterByPeriod)
    .filter(app => {
      if (selectedCalendarDate) {
        return app.date === selectedCalendarDate;
      }
      return true;
    })
    .filter(app => {
      if (!searchQuery) return true;
      const queryStr = searchQuery.toLowerCase();
      return (
        app.customerName.toLowerCase().includes(queryStr) ||
        app.customerEmail.toLowerCase().includes(queryStr) ||
        app.serviceId.toLowerCase().includes(queryStr)
      );
    });

  const processedInquiries = inquiries
    .filter(filterByPeriod)
    .filter(inq => {
      if (!searchQuery) return true;
      const queryStr = searchQuery.toLowerCase();
      return (
        inq.name.toLowerCase().includes(queryStr) ||
        inq.email.toLowerCase().includes(queryStr) ||
        inq.message.toLowerCase().includes(queryStr)
      );
    });

  // Calculate Stat Metrics (from all, or filtered depending on selection)
  const totalRevenue = appointments
    .filter(app => app.status === 'confirmed')
    .reduce((sum, app) => sum + getServicePrice(app.serviceId), 0);

  const pendingAppointmentsCount = appointments.filter(app => app.status === 'pending').length;
  const activeInquiriesCount = inquiries.length;

  // Render Calendar Grid Utility
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formattedDateString = (day: number) => {
    const dStr = day < 10 ? `0${day}` : `${day}`;
    const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    return `${year}-${mStr}-${dStr}`;
  };

  const getAppointmentsForDay = (day: number) => {
    const formatted = formattedDateString(day);
    return appointments.filter(app => app.date === formatted);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex justify-end">
        {/* Semi-transparent elegant dimming backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Dashboard Content Panel (Full-Sized Lateral Tray) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-[#FAF9F6] text-brand-ink w-full max-w-6xl h-full shadow-2xl flex flex-col z-10 select-none overflow-hidden"
        >
          {/* Header Bar */}
          <div className="bg-white border-b border-black/5 px-8 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-accent/10 text-brand-accent">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-serif">Lumina Beauty Operations</h2>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Admin Control Panel &bull; Verified: {auth.currentUser?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={loadAdminData}
                disabled={isRefreshing}
                className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh Live DB"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
              
              <button 
                onClick={onClose}
                className="bg-brand-ink text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-black transition-all cursor-pointer"
              >
                Exit Dashboard
              </button>
            </div>
          </div>

          {/* Immersive Scroll Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="luxury-card p-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-accent/5 rounded-bl-full" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Estimated Revenue</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-light">${totalRevenue}</span>
                  <span className="text-xs text-brand-accent font-medium flex items-center gap-0.5">
                    <TrendingUp size={12} /> Confirmed
                  </span>
                </div>
                <div className="mt-3 text-[10px] text-gray-400">Calculated from confirmed reservations</div>
              </div>

              <div className="luxury-card p-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Total Appointments</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-light">{appointments.length}</span>
                  <span className="text-xs text-blue-600 font-semibold">{pendingAppointmentsCount} Pending</span>
                </div>
                <div className="mt-3 text-[10px] text-gray-400">Across Gastown clinic catalog</div>
              </div>

              <div className="luxury-card p-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Active Client Inquiries</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-light">{activeInquiriesCount}</span>
                  <span className="text-xs text-amber-600 font-semibold">Unresolved</span>
                </div>
                <div className="mt-3 text-[10px] text-gray-400">Direct inquiries from boutique</div>
              </div>

              <div className="luxury-card p-6 bg-brand-ink text-brand-paper relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/10 rounded-full blur-xl" />
                <p className="text-[10px] uppercase tracking-wider text-[#D4A373] font-bold mb-1">Active Service Listings</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-light">{services.length}</span>
                  <span className="text-xs text-[#FAF9F6] font-light">Treatments</span>
                </div>
                <div className="mt-3 text-[10px] text-[#FAF9F6]/60">Seeded live catalog</div>
              </div>

            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Filter controls & search block */}
            <div className="bg-white border border-black/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Date Filters pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
                  <Filter size={12} /> Filter Period:
                </span>
                
                {(['all', 'today', 'yesterday', 'last-week', 'last-month', 'last-year'] as DateFilterType[]).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setSelectedCalendarDate(null); // Reset date-specific lock upon period state switch
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-tighter transition-all cursor-pointer ${
                      selectedPeriod === p && !selectedCalendarDate
                        ? 'bg-brand-ink text-white' 
                        : 'bg-brand-mute text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Dynamic Date Lock indication */}
              {selectedCalendarDate && (
                <div className="bg-brand-accent/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-brand-accent font-semibold animate-pulse mb-2 md:mb-0">
                  <CalendarIcon size={12} />
                  <span>Showing Day: {selectedCalendarDate}</span>
                  <button 
                    onClick={() => setSelectedCalendarDate(null)}
                    className="font-bold underline text-[10px] ml-1 uppercase text-black hover:text-brand-accent cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Text Query Filter */}
              <div className="relative w-full md:w-72 shrink-0">
                <input
                  type="text"
                  placeholder="Query customer name, email, treatment..."
                  className="input-field w-full text-xs pr-10 py-3 rounded-xl border border-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Primary Twin Columns: Calendar / Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Interactive Calendar Visualizer (Column Span 5) */}
              <div className="lg:col-span-5 bg-white border border-black/5 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Appointment Ledger</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={prevMonth}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-600"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold uppercase text-brand-ink tracking-widest min-w-[120px] text-center">
                      {monthNames[month]} {year}
                    </span>
                    <button 
                      onClick={nextMonth}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-600"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Weekdays Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <span key={day} className="text-[10px] uppercase font-bold text-gray-300 py-1">{day}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty headers for first week offset */}
                  {Array.from({ length: firstDayIndex }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square opacity-20" />
                  ))}

                  {/* Day Blocks */}
                  {Array.from({ length: daysInMonth }).map((_, dIndex) => {
                    const dayNum = dIndex + 1;
                    const dateStr = formattedDateString(dayNum);
                    const isSelected = selectedCalendarDate === dateStr;
                    const dayBookings = getAppointmentsForDay(dayNum);
                    const bookingCount = dayBookings.length;
                    
                    // Highlight color bases
                    const hasPending = dayBookings.some(b => b.status === 'pending');
                    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');

                    let borderClass = 'border-gray-50';
                    let bgClass = 'hover:bg-brand-mute/40';
                    let textClass = 'text-gray-700';

                    if (isSelected) {
                      bgClass = 'bg-brand-accent text-white';
                      borderClass = 'border-brand-accent';
                      textClass = 'text-white';
                    } else if (bookingCount > 0) {
                      borderClass = 'border-brand-accent/20';
                      bgClass = hasPending ? 'bg-amber-50 text-amber-700 font-semibold' : 'bg-green-50 text-emerald-800 font-semibold';
                    }

                    return (
                      <button
                        key={`day-${dayNum}`}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className={`aspect-square rounded-xl border ${borderClass} ${bgClass} ${textClass} text-xs transition-all relative flex flex-col items-center justify-center cursor-pointer`}
                      >
                        <span>{dayNum}</span>
                        {bookingCount > 0 && !isSelected && (
                          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${hasPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-around text-[10px] text-gray-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Pending Booking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Confirmed Session</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 border border-brand-accent bg-transparent shrink-0 rounded-sm" />
                    <span>Selected Date</span>
                  </div>
                </div>

              </div>

              {/* Live Workspace Actions / Appointments Queue (Column Span 7) */}
              <div className="lg:col-span-7 flex flex-col gap-6">

                {/* Appointments Deck */}
                <div className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-sm flex flex-col h-[520px]">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ritual Reservations Ledger</span>
                      <span className="bg-brand-ink text-brand-paper px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {processedAppointments.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-gray-400">
                        <RefreshCw size={24} className="animate-spin mb-2" />
                        <span>Synchronizing database catalog...</span>
                      </div>
                    ) : processedAppointments.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-brand-ink/50 py-12">
                        <CalendarIcon size={32} className="text-gray-300 mb-2" />
                        <span>No appointments match current filters in Gastown ledger.</span>
                      </div>
                    ) : (
                      processedAppointments.map(app => {
                        const amount = getServicePrice(app.serviceId);
                        const duration = getServiceDuration(app.serviceId);

                        return (
                          <div 
                            key={app.id} 
                            className="p-5 rounded-2xl border border-gray-50 hover:bg-gray-50/50 hover:border-gray-100 transition-all flex flex-col sm:flex-row justify-between gap-4"
                          >
                            <div className="space-y-1.5">
                              {/* Customer Header */}
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-sm font-medium">{app.customerName}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                  app.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                  'bg-amber-50 text-amber-600'
                                }`}>
                                  {app.status}
                                </span>
                              </div>

                              <p className="text-xs text-gray-400 font-mono">{app.customerEmail}</p>

                              {/* Service Specific Info */}
                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                <span className="text-xs font-semibold bg-brand-mute px-2.5 py-1 rounded-xl text-brand-ink flex items-center gap-1">
                                  <Sparkles size={12} className="text-brand-accent shrink-0" />
                                  <span>{app.serviceId}</span>
                                </span>

                                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                                  <Clock size={10} /> {duration} min &bull; ${amount}
                                </span>
                              </div>

                              {/* Date Selection Info */}
                              <p className="text-[10px] text-brand-accent/90 uppercase font-bold tracking-wider pt-0.5">
                                Scheduled: {app.date} @ {app.time}
                              </p>
                            </div>

                            {/* Actions Column */}
                            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                              {/* Large Pricing tag */}
                              <span className="text-lg font-light text-brand-ink">${amount}</span>

                              {/* Control Buttons */}
                              <div className="flex items-center gap-1.5 mt-2">
                                {app.status !== 'confirmed' && (
                                  <button
                                    onClick={() => updateAppointmentStatus(app.id!, 'confirmed')}
                                    className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all cursor-pointer"
                                    title="Confirm Booking"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                                {app.status !== 'cancelled' && (
                                  <button
                                    onClick={() => updateAppointmentStatus(app.id!, 'cancelled')}
                                    className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
                                    title="Cancel Booking"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                )}
                                {app.status !== 'pending' && (
                                  <button
                                    onClick={() => updateAppointmentStatus(app.id!, 'pending')}
                                    className="p-1.5 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                                    title="Set back to Pending"
                                  >
                                    <Clock size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Inquiries Shelf (Contact Submissions Desk) */}
            <div className="bg-white border border-black/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-accent" />
                <span>Contact Inquiry Desk</span>
                <span className="bg-brand-mute text-brand-ink text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-1">
                  {processedInquiries.length} Messages
                </span>
              </h3>

              {isLoading ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading Client feedback...</div>
              ) : processedInquiries.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-300">No customer support messages found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedInquiries.map(inq => {
                    const sentAt = getLocalDateTime(inq.createdAt);
                    
                    return (
                      <div 
                        key={inq.id} 
                        className="bg-[#FAF9F6] border border-gray-100/60 rounded-2xl p-5 shadow-sm relative hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <h4 className="font-serif text-sm font-medium leading-tight">{inq.name}</h4>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{inq.email}</p>
                            </div>
                            <button
                              onClick={() => removeInquiry(inq.id!)}
                              className="p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Delete Message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="p-3 bg-white rounded-xl text-xs text-gray-600 font-sans italic border border-gray-50 leading-relaxed min-h-[70px]">
                            "{inq.message}"
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-mono flex justify-between items-center">
                          <span>Sent: {sentAt.toLocaleDateString()}</span>
                          <span>{sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
