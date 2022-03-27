//
//  CardBottom.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 26-03-22.
//

import SwiftUI

/// Figura que representa la parte baja de la carta, donde se enumeran las stats.
/// Para que la forma quede con el aspecto correcto el frame debe estar en relación 28:21
struct CardBottom: Shape {
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let point1 = CGPoint(x: rect.minX, y: rect.minY)
        
        path.move(to: point1)
        
        let point2 = CGPoint(x: rect.maxX, y: rect.minY)
        
        path.addLine(to: point2)
        
        let point3 = CGPoint(x: rect.maxX, y: rect.maxY * 7 / 10.5)
        
        path.addLine(to: point3)
        
        let point4 = CGPoint(x: rect.midX, y: rect.maxY)
        
        let point4c1 = CGPoint(x: rect.maxX, y: rect.maxY * 8.5 / 10.5)
        
        let point4c2 = CGPoint(x: rect.maxX * 8 / 14, y: rect.maxY * 9 / 10.5)
        
        path.addCurve(to: point4,
                      control1: point4c1,
                      control2: point4c2)
        
        
        let point5 = CGPoint(x: rect.minX, y: rect.maxY * 7 / 10.5)
        
        let point5c1 = CGPoint(x: rect.maxX * 6 / 14, y: rect.maxY * 9 / 10.5)
        
        let point5c2 = CGPoint(x: rect.minX, y: rect.maxY * 8.5 / 10.5)
        
        path.addCurve(to: point5,
                      control1: point5c1,
                      control2: point5c2)
        
        path.addLine(to: point1)
        
        return path
    }
}

struct CardBottom_Previews: PreviewProvider {
    static var previews: some View {
        CardBottom()
            .frame(width: 28 * 10, height: 21 * 10)
    }
}
