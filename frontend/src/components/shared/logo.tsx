
import { Store } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex items-center justify-center -rotate-6 bg-brand text-white w-12 h-12 rounded-lg">
        <div className="rotate-6">
            <Store size={28} />
        </div>
    </div>
  );
};
