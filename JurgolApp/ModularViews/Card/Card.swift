//
//  Carta.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 27-03-22.
//

class Jugador: ObservableObject {
    let name = "Gallardo"
    let nacionality = "🇨🇱"
    
    let stringPosition = "POR"
    
    let colors = Bronze()
    
    let stat1: Int16 = 80
    let stat2: Int16 = 80
    let stat3: Int16 = 80
    let stat4: Int16 = 80
    let stat5: Int16 = 80
    let stat6: Int16 = 80
    
    var average: Int {
        return 80
    }
}

import SwiftUI

/// Vista que representa la carta de un jugador.
/// - Warning: Las lineas comentadas son en caso de que se quiera un borde para la carta.
/// - Parameter width: El ancho que se quiere para la carta.
/// - Parameter type: La calidad de la carta.
struct Card: View {
    
    @Binding var displayed: Bool
    
    @State var widthCard: CGFloat
    
    @ObservedObject var player = Jugador()

    init(width: CGFloat, _ displayed: Binding<Bool>) {
        
        self.widthCard = width
        self._displayed = displayed
        
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
    }
}

struct Carta: View {
    @State var displayed = true
    var body: some View {
        Button(action: {
            withAnimation {
                displayed.toggle()
        }
        }, label: {
            Card(width: 300, $displayed)
        })
    }
}

struct Carta_Previews: PreviewProvider {
    static var previews: some View {
        Carta()
    }
}
