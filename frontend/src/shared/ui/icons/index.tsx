// frontend/src/shared/ui/icons/index.tsx
import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
	size?: number | string;
}

export const CloseIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
	</svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
		/>
	</svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
		/>
	</svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
		/>
	</svg>
);

export const MailIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
		/>
	</svg>
);

export const LocationIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
		/>
	</svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
		/>
	</svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
		/>
	</svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
	</svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg
		width={size}
		height={size}
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
		/>
	</svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
		<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.77.818 2.796.818 3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.769-5.769-5.769zm10.219 5.767c-.001 5.652-4.599 10.248-10.25 10.248-1.796 0-3.56-.474-5.112-1.371l-5.698 1.493 1.521-5.556c-1.002-1.611-1.531-3.486-1.531-5.412 0-5.651 4.598-10.247 10.25-10.247 5.651.001 10.248 4.598 10.248 10.248zm-14.773 2.89c.148.25.474.398.723.498.249.099.524.099.773.05.249-.05 1.545-.632 1.767-.881.222-.249.222-.498.148-.647-.074-.149-.297-.249-.646-.423-.349-.174-2.067-1.02-2.39-1.144-.323-.124-.572-.124-.821.124-.249.249-.947 1.144-1.171 1.393-.224.249-.448.274-.797.1-.349-.174-1.472-.543-2.805-1.732-1.037-.925-1.738-2.068-1.937-2.417-.199-.349-.021-.537.153-.711.157-.156.349-.408.523-.612.174-.204.232-.349.349-.572.116-.224.058-.423-.029-.597-.087-.174-.797-1.921-1.092-2.631-.286-.692-.577-.597-.797-.607-.206-.01-.442-.012-.678-.012s-.618.087-.942.441c-.324.349-1.238 1.211-1.238 2.952 0 1.741 1.267 3.424 1.444 3.663.177.239 2.493 3.807 6.039 5.337.844.364 1.503.582 2.016.745.848.269 1.62.231 2.23.14.68-.101 2.067-.845 2.359-1.66.292-.815.292-1.513.204-1.66-.088-.147-.324-.236-.673-.41z" />
	</svg>
);

export const TelegramIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, ...props }) => (
	<svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
		<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.942z" />
	</svg>
);
