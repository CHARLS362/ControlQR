
'use client';

import * as React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, BarChart2 } from 'lucide-react';
import type { StudentDetails } from '@/lib/types';

interface StudentCodesProps {
    details: StudentDetails;
}

export function StudentCodes({ details }: StudentCodesProps) {

  const getBarcodeValue = () => {
    if (!details || typeof details.nombres !== 'string') {
        return '';
    }
    const nameParts = details.nombres.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[1] : '';
    return `${firstName} ${lastName}`.trim();
  }

  return (
    <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="qr"><QrCode className="mr-2" />Código QR</TabsTrigger>
        <TabsTrigger value="barcode"><BarChart2 className="mr-2" />Código de Barras</TabsTrigger>
        </TabsList>
        <TabsContent value="qr">
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4">
            <QRCodeSVG
            value={details.codigo_hash || ''}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
            />
            <p className="mt-2 text-sm font-semibold">{getBarcodeValue()}</p>
        </div>
        </TabsContent>
        <TabsContent value="barcode">
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4">
            {details.codigo && (
              <Barcode 
                  value={details.codigo}
                  width={1}
                  height={50}
                  fontSize={12}
                  text={getBarcodeValue()}
              />
            )}
        </div>
        </TabsContent>
    </Tabs>
  );
}
