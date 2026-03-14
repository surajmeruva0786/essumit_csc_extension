import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Check
} from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import NavigationButtons from '../components/NavigationButtons';
import { services } from '../config/services';

export default function ServiceSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, mobile } = location.state || {};
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedService) {
      navigate('/documents', { state: { name, mobile, serviceId: selectedService } });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        {/* User Message - showing entered details */}
        <ChatBubble 
          type="user"
          content={`${name} • +91 ${mobile}`}
        />

        {/* Bot Message */}
        <ChatBubble 
          type="bot"
          titleHi="कौन सी सेवा चाहिए?"
          titleEn="Which service is needed?"
        />

        {/* Service Grid */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {services.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`relative p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-green bg-green-light shadow-sm'
                      : 'border-border-custom bg-surface hover:border-saffron hover:bg-saffron-light/30'
                  }`}
                >
                  {/* Checkmark badge */}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg mb-2.5 flex items-center justify-center mx-auto ${
                    isSelected ? 'bg-green/10' : 'bg-navy/5'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-green' : 'text-navy'}`} strokeWidth={2} />
                  </div>
                  
                  {/* Hindi Name */}
                  <div className="text-xs font-semibold text-navy text-center mb-0.5">
                    {service.nameHi}
                  </div>
                  
                  {/* English Name */}
                  <div className="text-[10px] text-muted-text text-center leading-tight">
                    {service.nameEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <NavigationButtons
        onNext={handleContinue}
        nextDisabled={!selectedService}
      />
    </div>
  );
}