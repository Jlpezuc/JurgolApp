//
//  Carta.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 27-03-22.
//

import SwiftUI

/// Vista que une los shapes de carta en una sola
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
        ZStack {
            VStack(spacing: 0) {
                CardTop()
                    .fill(topGradient)
                    .frame(width: width, height: width * 6 / 7)
                CardBottom()
                    .fill(bottomGradient)
                    .frame(width: width, height: width * 21 / 28)
            }
//            VStack(spacing: 0) {
//                CardTop()
//                    .stroke(lineWidth: 3)
//                    .frame(width: width, height: width * 6 / 7)
//                CardBottom()
//                    .stroke(lineWidth: 3)
//                    .frame(width: width, height: width * 21 / 28)
//            }
        }
    }
}

struct Carta_Previews: PreviewProvider {
    static var previews: some View {
        Card(width: 300, type: .bronze)
    }
}
