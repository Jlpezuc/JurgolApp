//
//  ExtensionsCard.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 31-03-22.
//

import Foundation
import SwiftUI

extension Card {
    var data: some View {
        HStack(spacing: 0) {
            VStack(spacing: 0) {
                Text(String(player.average))
                    .formatAsAverage(widthCard: widthCard)
                
                Text(player.stringPosition!)
                    .formatAsPosition(widthCard: widthCard)
                Rectangle()
                    .foregroundColor(.black)
                    .frame(width: widthCard * 1 / 8, height: 2)
                Text(player.country!)
                    .formatAsNacionality(widthCard: widthCard)
                
            }
            Spacer()
                .frame(width: widthCard / 2)
        }
    }
}

extension Card {
    var numeros: some View {
        VStack(spacing: 10) {
            TextField("Nombre", text: Binding($player.name)!)
                .formatAsName(widthCard: widthCard)
                .disabled(!editable)
            Rectangle()
                .frame(width: widthCard * 4 / 5, height: 2)
                .cornerRadius(3.0)
                .foregroundColor(.black)
            ZStack {
                HStack(spacing: 0) {
                    Spacer()
                    VStack(spacing: 0) {
                        HStack(spacing: 0) {
                            Text(String(player.stat1.asInt))
                                .formatAsStat(widthCard: widthCard)
                            Text(player.golKeeper ? "EST" : "RIT")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat2.asInt))
                                .formatAsStat(widthCard: widthCard)
                            Text(player.golKeeper ? "PAR" : "TIR")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat3.asInt))
                                .formatAsStat(widthCard: widthCard)
                            Text(player.golKeeper ? "SAC" : "PAS")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                    }
                    Spacer()
                    VStack(spacing: 0) {
                        HStack(spacing: 0) {
                            Text(String(player.stat4.asInt))
                                .formatAsStat(widthCard: widthCard)
                            Text(player.golKeeper ? "REF" : "REG")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat5.asInt))
                                .formatAsStat(widthCard: widthCard)
                            Text(player.golKeeper ? "DEF" : "VEL")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat6.asInt))
                                .formatAsStat(widthCard: widthCard)
                            Text(player.golKeeper ? "FIS" : "POS")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                    }
                    Spacer()
                }
                HStack {
                    Spacer()
                    Rectangle()
                        .frame(width: 2, height: widthCard * 21 / 28 * 2 / 6)
                        .cornerRadius(3.0)
                        .foregroundColor(.black)
                    Spacer()
                }
                
            }
            Rectangle()
                .frame(width: widthCard * 1 / 7, height: 2)
                .cornerRadius(3.0)
                .foregroundColor(.black)
            Spacer()
                .frame(height: widthCard * 1 / 15)
        }
    }
}

extension Card {
    
    var top: some View {
        CardTop()
            .fill(LinearGradient(gradient: Gradient(colors: [player.colors.topLight, player.colors.bottomLight]), startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: widthCard, height: widthCard * 6 / 7)
    }
    
    var bottom: some View {
        CardBottom()
            .fill(LinearGradient(gradient: Gradient(colors: [player.colors.bottomDark, player.colors.bottomLight, player.colors.bottomDark]), startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: widthCard, height: widthCard * 21 / 28)
    }
}

