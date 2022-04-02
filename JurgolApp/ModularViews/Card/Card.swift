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
    
    @Binding var displayed: Bool
    
    @Binding var editable: Bool
    
    @State var widthCard: CGFloat
    
    @ObservedObject var player: Player

    init(width: CGFloat, displayed: Binding<Bool>, editable: Binding<Bool>, player: Player) {
        
        self.player = player
        
        self.widthCard = width
        self._displayed = displayed
        
        self._editable = editable
        
    }
    
    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                top
                data
                
            }.offset(y: displayed ? 0 : widthCard * 7 / 28).zIndex(1)
            ZStack {
                bottom
                numeros
                    .opacity(displayed ? 1 : 0)
            }.offset(y: displayed ? 0 : -widthCard * 7 / 28).zIndex(0)
        }.frame(width: widthCard, height: displayed ? widthCard * 45 / 28 : widthCard * 33 / 28)
        .onTapGesture { hideKeyboard() }
    }
}


