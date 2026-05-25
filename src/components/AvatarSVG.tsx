export type BodyType = 'heavy' | 'medium' | 'fit' | 'slim';

interface AvatarSVGProps {
  bodyType?: BodyType | string;
  className?: string;
  size?: number; // retained for API compatibility, unused
}

export function AvatarSVG({ bodyType = 'medium', className, size = 200 }: AvatarSVGProps) {
  const isHeavy = bodyType === 'heavy' || bodyType === 'medium';

  const img = (
    <img
      src={isHeavy ? '/Mujer%20izquierda.png' : '/Mujer%20derecha.png'}
      style={{
        width: '80%',
        height: 'auto',
        maxHeight: `${size}px`,
        objectFit: 'contain',
        mixBlendMode: 'multiply',
        display: 'block',
      }}
      alt="avatar"
    />
  );

  if (className) {
    return (
      <div className={`flex items-end justify-center ${className}`}>
        {img}
      </div>
    );
  }

  return img;
}

export default AvatarSVG;
