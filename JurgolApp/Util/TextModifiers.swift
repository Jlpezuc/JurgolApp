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



extension TextField {
    func formatAsStat(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 12).weight(.semibold))
            .frame(width: widthCard / 6, height: widthCard / 12)
            .multilineTextAlignment(.center)
            .keyboardType(.numberPad)
    }
    func formatAsNameStat(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 13).weight(.semibold))
            .frame(width: widthCard / 6, height: widthCard / 12)
            .multilineTextAlignment(.center)
    }
    func formatAsName(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 8).weight(.semibold))
            .frame(width: widthCard * 4 / 5, height: widthCard / 8)
            .multilineTextAlignment(.center)
    }
    
    func formatAsAverage(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 5.5).weight(.semibold))
            .multilineTextAlignment(.center)
            .padding(.top)
        
    }
    func formatAsPosition(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 10).weight(.semibold))
            .multilineTextAlignment(.center)
    }
    func formatAsNacionality(widthCard: CGFloat) -> some View {
        self
            .foregroundColor(.black)
            .font(.system(size: widthCard / 5.5).weight(.semibold))
            .frame(width: widthCard / 5, height: widthCard / 6)
            .multilineTextAlignment(.center)
    }
}



extension View {
    func hideKeyboard() {
        let resign = #selector(UIResponder.resignFirstResponder)
        UIApplication.shared.sendAction(resign, to: nil, from: nil, for: nil)
    }
}
