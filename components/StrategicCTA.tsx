import { ArrowRight, Calendar, Sparkles, Clock } from 'lucide-react';

interface StrategicCTAProps {
  variant?: 'primary' | 'secondary' | 'urgency' | 'minimal';
  title: string;
  description?: string;
  buttonText: string;
  onAction: () => void;
  urgencyText?: string;
  icon?: 'arrow' | 'calendar' | 'sparkles' | 'clock';
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
}

export default function StrategicCTA({
  variant = 'primary',
  title,
  description,
  buttonText,
  onAction,
  urgencyText,
  icon = 'arrow',
  branding,
}: StrategicCTAProps) {
  const primaryColor = branding?.primaryColor || '#0ea5e9';
  const accentColor = branding?.accentColor || '#06b6d4';

  const iconMap = {
    arrow: ArrowRight,
    calendar: Calendar,
    sparkles: Sparkles,
    clock: Clock,
  };

  const Icon = iconMap[icon];

  // Variante Primary: CTA principal com gradiente e destaque máximo
  if (variant === 'primary') {
    return (
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              {description && (
                <p className="text-white/90 text-base leading-relaxed">{description}</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {urgencyText && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{urgencyText}</span>
            </div>
          )}

          <button
            onClick={onAction}
            className="group bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            {buttonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
        />
        <div
          className="absolute -left-4 -top-4 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
        />
      </div>
    );
  }

  // Variante Urgency: Destaca escassez e urgência
  if (variant === 'urgency') {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
              {description && (
                <p className="text-slate-700 text-sm">{description}</p>
              )}
            </div>
          </div>

          {urgencyText && (
            <div className="bg-orange-100 border border-orange-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {urgencyText}
              </p>
            </div>
          )}

          <button
            onClick={onAction}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {buttonText}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Variante Secondary: CTA mais suave e menos invasivo
  if (variant === 'secondary') {
    return (
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-900 mb-1">{title}</h4>
            {description && (
              <p className="text-sm text-slate-600">{description}</p>
            )}
          </div>
          <button
            onClick={onAction}
            className="group px-6 py-3 rounded-lg font-medium text-white shadow-sm hover:shadow transition-all flex items-center gap-2 whitespace-nowrap ml-4"
            style={{ backgroundColor: primaryColor }}
          >
            {buttonText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Variante Minimal: CTA discreto e inline
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-700 font-medium">{title}</p>
        <button
          onClick={onAction}
          className="group text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          style={{ color: primaryColor }}
        >
          {buttonText}
          <ArrowRight className="w-4 h-4 transition-all" />
        </button>
      </div>
    );
  }

  return null;
}
