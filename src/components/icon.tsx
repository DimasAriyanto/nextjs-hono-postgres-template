import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { ComponentType } from 'react';

export type IconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon'>;

interface IconProps extends LucideProps {
	name: IconName;
}

export const Icon = ({ name, ...props }: IconProps) => {
	const Component = LucideIcons[name] as ComponentType<LucideProps> | undefined;

	if (!Component) {
		console.warn(`Lucide icon "${name}" not found. Rendering fallback icon.`);
		const Fallback = LucideIcons.HelpCircle;
		return <Fallback {...props} />;
	}

	return <Component {...props} />;
};
