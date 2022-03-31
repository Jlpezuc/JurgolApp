//
//  ViewModifiers.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 30-03-22.
//

import Foundation
import SwiftUI

extension Text {
    func formatAsStat(widthCard: CGFloat) -> some View {
        self
            .bold()
            .foregroundColor(.black)
            .font(.system(size: widthCard / 12))
            .frame(width: widthCard / 6, height: widthCard / 12)
    }
    func formatAsNameStat(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 13))
            .frame(width: widthCard / 6, height: widthCard / 12)
    }
    func formatAsName(widthCard: CGFloat) -> some View {
        self
            .bold()
            .foregroundColor(.black)
            .font(.system(size: widthCard / 8))
            .frame(width: widthCard, height: widthCard / 8)
    }
    
    func formatAsAverage(widthCard: CGFloat) -> some View {
        self
            .bold()
            .foregroundColor(.black)
            .font(.system(size: widthCard / 5.5))
            .padding(.top)
        
    }
    func formatAsPosition(widthCard: CGFloat) -> some View {
        self
            .bold()
            .foregroundColor(.black)
            .font(.system(size: widthCard / 10))
    }
    func formatAsNacionality(widthCard: CGFloat) -> some View {
        self
            .bold()
            .foregroundColor(.black)
            .font(.system(size: widthCard / 5.5))
            .frame(width: widthCard / 5, height: widthCard / 6)
    }
}
