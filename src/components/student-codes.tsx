
'use client';

import * as React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import type { StudentDetails } from '@/lib/types';

interface StudentCodesProps {
    details: StudentDetails;
}

export function StudentCodes({ details }: StudentCodesProps) {

  const getDisplayName = () => {
    if (!details || typeof details.nombres !== 'string') {
        return '';
    }
    const nameParts = details.nombres.split(' ');
    // Toma el primer nombre y el primer apellido
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 2 ? nameParts[2] : (nameParts[1] || '');
    return `${firstName} ${lastName}`.trim();
  }

  return (
    <div className="flex justify-around items-center p-4 bg-white rounded-md mt-4 w-full">
        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center">
            <QRCodeSVG
                value={details.codigo_hash || ''}
                size={128}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
            />
            <p className="mt-2 text-xs font-semibold tracking-wider">{getDisplayName()}</p>
        </div>

        {/* Barcode Section */}
        <div className="flex flex-col items-center justify-center">
            {details.codigo && (
              <Barcode 
                  value={details.codigo}
                  width={1.5}
                  height={60}
                  fontSize={12}
                  text={getDisplayName()}
                  margin={10}
              />
            )}
        </div>
    </div>
  );
}
