import { useState } from 'react';

interface ShoeImageProps {
	src: string;
	alt: string;
	className?: string;
	missingOriginalImageClassName?: string;
	style?: React.CSSProperties;
}

const ShoeImage = ({ src, alt, className = '', missingOriginalImageClassName, style }: ShoeImageProps) => {
	const [originalImageLoaded, setOriginalImageLoaded] = useState(true);

	return (
		<img
			src={originalImageLoaded ? src : '/assets/icon.png'}
			alt={alt}
			className={originalImageLoaded ? className : missingOriginalImageClassName || className}
			style={style}
			onError={() => setOriginalImageLoaded(false)}
		/>
	);
};

export default ShoeImage;
