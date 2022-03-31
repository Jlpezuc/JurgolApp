//
//  CardTop.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 27-03-22.
//

import SwiftUI


/// Figura que representa la parte alta de la carta, donde aparece la foto.
/// Para que la forma quede con el aspecto correcto el frame debe estar en relación 7:6
struct CardTop: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let point1 = CGPoint(x: rect.maxX, y: rect.maxY * 2.5 / 12)

        path.move(to: point1)

        let point2 = CGPoint(x: rect.maxX, y: rect.maxY)

        path.addLine(to: point2)

        let point3 = CGPoint(x: rect.minX, y: rect.maxY)

        path.addLine(to: point3)

        let point4 = CGPoint(x: rect.minX, y: rect.maxY * 2.5 / 12)

        path.addLine(to: point4)


        let point5 = CGPoint(x: rect.maxX * 1.7 / 14, y: rect.maxY * 0.7 / 12)

        let point5c = CGPoint(x: rect.maxX * 1.5 / 14, y: rect.maxY * 2.5 / 12)

        path.addQuadCurve(to: point5, control: point5c)
        
        
        let point6 = CGPoint(x: rect.midX, y: rect.minY)
        
        let point6c = CGPoint(x: rect.maxX * 4 / 14, y: rect.minY)

        path.addQuadCurve(to: point6, control: point6c)
        
        
        let point7 = CGPoint(x: rect.maxX * 12.3 / 14, y: rect.maxY * 0.7 / 12)
        
        let point7c = CGPoint(x: rect.maxX * 10 / 14, y: rect.minY)

        path.addQuadCurve(to: point7, control: point7c)
        

        let point8c = CGPoint(x: rect.maxX * 12.5 / 14, y: rect.maxY * 2.5 / 12)

        path.addQuadCurve(to: point1, control: point8c)
        
        
        return path
    }
}

struct CardTop_Previews: PreviewProvider {
    static var previews: some View {
        
            CardTop().frame(width: 7 * 50, height: 6 * 50)

    }
}
