import { forwardRef } from 'react';
import { ChatBubbleLeftRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { CTACard } from './CTACard';

interface CTASidebarProps {
  className?: string;
}

export const CTASidebar = forwardRef<HTMLDivElement, CTASidebarProps>(
  ({ className }, ref) => {
    return (
      <aside
        ref={ref}
        className={className}
      >
        <div className="space-y-4">
          <CTACard
            icon={ChatBubbleLeftRightIcon}
            title="Join Our Discord"
            description="Connect with fellow researchers, share your work, and join discussions."
            buttonText="Join Now"
            href="https://discord.com/invite/m3qvuXgkZ7"
            variant="primary"
          />
          <CTACard
            icon={UserGroupIcon}
            title="ISAL Membership"
            description="Support the ALife community and gain access to member benefits."
            buttonText="Learn More"
            href="https://alife.org/membership/"
            variant="secondary"
          />
        </div>
      </aside>
    );
  }
);

CTASidebar.displayName = 'CTASidebar';
