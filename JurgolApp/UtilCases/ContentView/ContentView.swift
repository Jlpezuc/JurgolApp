//
//  ContentView.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 07-04-16.
//

import SwiftUI
import CoreData

struct ContentView: View {
    
    @ObservedObject var vm = ContentViewViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack {
                    NavigationLink(
                        destination: CreateACard(),
                        label: {
                            Text("Navigate")
                        })
                    ForEach(vm.players) {player in
                        Card(width: 200, displayed: .constant(true), editable: .constant(false), player: player)
                    }
                }
            }
        }
    }
}

struct CreateACard: View {
    
    @ObservedObject var vm = CreateACardViewModel()
    
    var body: some View {
        ScrollView {
            VStack {
                Card(width: 300, displayed: .constant(true), editable: .constant(true), player: vm.newPlayer)
                TextField("name", text: Binding($vm.newPlayer.name)!)
                Slider(value: $vm.newPlayer.stat1, in: 1...99, step: 1)
                Slider(value: $vm.newPlayer.stat2, in: 1...99, step: 1)
                Slider(value: $vm.newPlayer.stat3, in: 1...99, step: 1)
                Slider(value: $vm.newPlayer.stat4, in: 1...99, step: 1)
                Slider(value: $vm.newPlayer.stat5, in: 1...99, step: 1)
                Slider(value: $vm.newPlayer.stat6, in: 1...99, step: 1)
                Picker(selection: $vm.newPlayer.stringPosition, label: /*@START_MENU_TOKEN@*/Text("Picker")/*@END_MENU_TOKEN@*/, content: {
                    ForEach(Position.allCases) {position in
                        Text(position.acronym).tag(position.acronym.uppercased())
                    }
                })
                Group {
                    Picker(selection: $vm.newPlayer.stringType, label: /*@START_MENU_TOKEN@*/Text("Picker")/*@END_MENU_TOKEN@*/, content: {
                        Text("Oro").tag("Oro")
                        Text("Plata").tag("Plata")
                        Text("Bronce").tag("Bronce")
                    })
                    Button(action: {vm.addPlayer()}, label: {
                        /*@START_MENU_TOKEN@*/Text("Button")/*@END_MENU_TOKEN@*/
                    })
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
