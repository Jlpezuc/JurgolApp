//
//  Carta.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 27-03-22.
//

import SwiftUI

/// Vista que representa la carta de un jugador.
/// - Warning: Las lineas comentadas son en caso de que se quiera un borde para la carta.
/// - Parameter width: El ancho que se quiere para la carta.
/// - Parameter type: La calidad de la carta.
struct Card: View {
    
    enum CardType {
        case gold, silver, bronze
    }
    
    let width: CGFloat
    
    let colors: CardColors
    
    let topGradient: LinearGradient
    let bottomGradient: LinearGradient
    
    init(width: CGFloat, type: CardType) {
        self.width = width
        switch type {
        case .gold:
            colors = Gold()
        case .silver:
            colors = Silver()
        case .bronze:
            colors = Bronze()
        }

        topGradient = LinearGradient(gradient: Gradient(colors: [colors.topLight, colors.bottomLight]), startPoint: .topLeading, endPoint: .bottomTrailing)
        
        bottomGradient = LinearGradient(gradient: Gradient(colors: [colors.bottomDark, colors.bottomLight, colors.bottomDark]), startPoint: .topLeading, endPoint: .bottomTrailing)
    }
    
    var body: some View {
        VStack(spacing: 0) {
            CardTop()
                .fill(topGradient)
                .frame(width: width, height: width * 6 / 7)
            CardBottom()
                .fill(bottomGradient)
                .frame(width: width, height: width * 21 / 28)
        }
    }
}

extension Card {
    var numeros: some View {
        EmptyView()
    }
}

struct Carta_Previews: PreviewProvider {
    static var previews: some View {
        Card(width: 300, type: .bronze)
    }
}
