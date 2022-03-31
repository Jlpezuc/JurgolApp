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
                
                Text(player.stringPosition)
                    .formatAsPosition(widthCard: widthCard)
                Rectangle()
                    .foregroundColor(.black)
                    .frame(width: widthCard * 1 / 8, height: 2)
                Text(player.nacionality)
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
            Text(player.name)
                .formatAsName(widthCard: widthCard)
            Rectangle()
                .frame(width: widthCard * 4 / 5, height: 2)
                .cornerRadius(3.0)
                .foregroundColor(.black)
            ZStack {
                HStack(spacing: 0) {
                    Spacer()
                    VStack(spacing: 0) {
                        HStack(spacing: 0) {
                            Text(String(player.stat1))
                                .formatAsStat(widthCard: widthCard)
                            Text("PAC")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat2))
                                .formatAsStat(widthCard: widthCard)
                            Text("SHO")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat3))
                                .formatAsStat(widthCard: widthCard)
                            Text("PAS")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                    }
                    Spacer()
                    VStack(spacing: 0) {
                        HStack(spacing: 0) {
                            Text(String(player.stat4))
                                .formatAsStat(widthCard: widthCard)
                            Text("DRI")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat5))
                                .formatAsStat(widthCard: widthCard)
                            Text("DEF")
                                .formatAsNameStat(widthCard: widthCard)
                        }
                        HStack(spacing: 0) {
                            Text(String(player.stat6))
                                .formatAsStat(widthCard: widthCard)
                            Text("PHY")
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
