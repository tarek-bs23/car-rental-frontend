import { useNavigate } from 'react-router-dom';
import { TopBar } from '../layout/TopBar';
import { BottomNav } from '../layout/BottomNav';
import { Car, UserCircle, Shield, ChevronRight, Star, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'vehicles',
      title: 'Luxury Vehicles',
      description: 'Premium cars, SUVs & sports cars',
      icon: Car,
      gradient: 'from-neutral-900 via-neutral-800 to-neutral-900',
      route: '/vehicles',
      badge: 'Most Popular'
    },
    {
      id: 'drivers',
      title: 'Professional Chauffeur',
      description: 'Experienced drivers at your service',
      icon: UserCircle,
      gradient: 'from-neutral-800 via-neutral-700 to-neutral-800',
      route: '/drivers',
      badge: null
    },
    {
      id: 'bodyguards',
      title: 'Executive Security',
      description: 'Elite protection & security teams',
      icon: Shield,
      gradient: 'from-neutral-700 via-neutral-600 to-neutral-700',
      route: '/bodyguards',
      badge: 'Premium'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopBar />
      
      <div className="pt-14">
        {/* Premium Hero Section */}
        <div className="px-6 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 rounded-full text-sm font-medium text-[#b8941f]">
                <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                Premium Service
              </span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
              Elite Luxury<br />Services
            </h1>
            <p className="text-lg text-neutral-600">
              Choose your premium experience
            </p>
          </motion.div>
        </div>

        {/* Service Cards - Uber-inspired minimal design */}
        <div className="px-6 pb-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => navigate(service.route)}
                  className="w-full group relative overflow-hidden"
                >
                  <div className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10`}>
                    {service.badge && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-[#d4af37] rounded-full text-xs font-semibold text-neutral-900">
                          {service.badge}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h2 className="text-xl font-semibold text-white mb-1">
                          {service.title}
                        </h2>
                        <p className="text-sm text-white/70">
                          {service.description}
                        </p>
                      </div>
                      
                      <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Trust Signals - Hertz-inspired */}
        <div className="px-6 pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-neutral-50 rounded-xl p-4 text-center border border-neutral-100"
              >
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-[#b8941f]" />
                </div>
                <p className="text-2xl font-bold text-neutral-900 mb-1">4.9</p>
                <p className="text-xs text-neutral-600">Rating</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-neutral-50 rounded-xl p-4 text-center border border-neutral-100"
              >
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-[#b8941f]" />
                </div>
                <p className="text-2xl font-bold text-neutral-900 mb-1">50k+</p>
                <p className="text-xs text-neutral-600">Bookings</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-neutral-50 rounded-xl p-4 text-center border border-neutral-100"
              >
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-[#b8941f]" />
                </div>
                <p className="text-2xl font-bold text-neutral-900 mb-1">24/7</p>
                <p className="text-xs text-neutral-600">Support</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Premium Features Banner */}
        <div className="px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-[#d4af37] rounded-full" />
                <h3 className="text-lg font-semibold text-white">Why Choose Us</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                  <span className="text-sm">Verified luxury fleet with premium insurance</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                  <span className="text-sm">Professional chauffeurs with 10+ years experience</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                  <span className="text-sm">Instant booking with flexible cancellation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}