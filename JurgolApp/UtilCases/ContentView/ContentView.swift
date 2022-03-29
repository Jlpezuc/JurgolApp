//
//  ContentView.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 07-04-16.
//

import SwiftUI
import CoreData

#warning("En caso de cambiar de nombre a ContentView, Hacer lo mismo con su ViewModel")

struct ContentView: View {
    
    @ObservedObject var vm = ContentViewViewModel()
    

//    @FetchRequest(
//        sortDescriptors: [NSSortDescriptor(keyPath: \Item.timestamp, ascending: true)],
//        animation: .default)
//    private var items: FetchedResults<Item>

    var body: some View {
        VStack {
            HStack {
                TextField("Nombre", text: $vm.name)
                Spacer()
                Button(action: {vm.addPlayer()}) {
                    Image(systemName: "plus")
                }
            }.padding()
        }
        List {
            ForEach(vm.players) { player in
                VStack {
                    Text("Jugador: " + player.name)
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
