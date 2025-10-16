import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 7h3v3H7zM7 14h3v3H7zM14 7h3v3h-3zM14 14h3v3h-3z" />
    </svg>
  );
}

export function PlaceholderQrCode(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      shapeRendering="crispEdges"
      {...props}
    >
      <path fill="#000000" d="M0 0h30v30H0zM70 0h30v30H70zM0 70h30v30H0z" />
      <path
        fill="#000000"
        d="M10 10h10v10H10zM80 10h10v10H80zM10 80h10v10H10z"
        opacity="0.8"
      />
      <path
        fill="#000000"
        d="M40 0h10v10H40z M60 0h10v10H60z M0 40h10v10H0z M0 60h10v10H0z M40 100v-10h10v10z M60 100v-10h10v10z M100 40h-10v10h10z M100 60h-10v10h10z"
        opacity="0.5"
      />
      <path
        fill="#000000"
        d="M30 30h10v10H30z M40 40h20v20H40z M70 30h10v10H70z M30 70h10v10H30z M70 70h10v10H70z"
        opacity="0.9"
      />
      <path
        fill="#000000"
        d="M30 10h10v10H30z M50 10h10v10H50z M10 30h10v10H10z M10 50h10v10H10z M30 50h10v10H30z M50 30h10v10H50z M70 10h10v10H70z M90 10h10v10H90z M90 30h10v10H90z M70 50h10v10H70z M90 50h10v10H90z M10 70h10v10H10z M30 90h10v10H30z M50 70h10v10H50z M50 90h10v10H50z M70 70h10v10H70z M90 70h10v10H90z M70 90h10v10H70z M90 90h10v10H90z"
        opacity="0.3"
      />
    </svg>
  );
}
