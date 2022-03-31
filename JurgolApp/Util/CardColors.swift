//
//  CardColors.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 27-03-22.
//

import Foundation
import SwiftUI

protocol CardColors {
    
    var topLight: Color { get }
    var topDark: Color { get }
    
    var bottomLight: Color { get }
    var bottomDark: Color { get }
    
}


struct Gold: CardColors {
    var topLight: Color = Color(#colorLiteral(red: 0.9475951791, green: 0.9122151342, blue: 0.5497036155, alpha: 1))
    
    var topDark: Color = Color(#colorLiteral(red: 0.8117647059, green: 0.7411764706, blue: 0.4196078431, alpha: 1))
    
    var bottomLight: Color = Color(#colorLiteral(red: 0.9647058824, green: 0.9058823529, blue: 0.6274509804, alpha: 1))
    
    var bottomDark: Color = Color(#colorLiteral(red: 0.9247849024, green: 0.823643377, blue: 0.3198730227, alpha: 1))
    
}

struct Silver: CardColors {
    var topLight: Color = Color(#colorLiteral(red: 0.862745098, green: 0.862745098, blue: 0.862745098, alpha: 1))
    
    var topDark: Color = Color(#colorLiteral(red: 0.8, green: 0.8, blue: 0.8, alpha: 1))
    
    var bottomLight: Color = Color(#colorLiteral(red: 0.831372549, green: 0.831372549, blue: 0.831372549, alpha: 1))
    
    var bottomDark: Color = Color(#colorLiteral(red: 0.6431372549, green: 0.6431372549, blue: 0.6431372549, alpha: 1))
    
}

struct Bronze: CardColors {
    var topLight: Color = Color(#colorLiteral(red: 0.968627451, green: 0.831372549, blue: 0.5490196078, alpha: 1))
    
    var topDark: Color = Color(#colorLiteral(red: 0.9254901961, green: 0.7764705882, blue: 0.5254901961, alpha: 1))
    
    var bottomLight: Color = Color(#colorLiteral(red: 0.9607843137, green: 0.831372549, blue: 0.5921568627, alpha: 1))
    
    var bottomDark: Color = Color(#colorLiteral(red: 0.8, green: 0.6431372549, blue: 0.3882352941, alpha: 1))
    
}
