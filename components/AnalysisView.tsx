import React from 'react';
import type { AnalysisResult } from '../types';
import { Gender, Occasion } from '../types';
import ResetIcon from './icons/ResetIcon';

interface AnalysisViewProps {
    capturedImage: string;
    analysis: AnalysisResult;
    recommendedItemImages: string[]; // base64 string array
    onReset: () => void;
    gender: Gender;
    occasion: Occasion;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ capturedImage, analysis, recommendedItemImages, onReset, gender, occasion }) => {

    return (
        <div className="w-full h-full flex flex-col p-2 md:p-6 bg-gray-800 rounded-2xl">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-teal-400">Your Style Report</h1>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                >
                    <ResetIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Try Again</span>
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-0">
                {/* Left Column: Captured Image & Analysis */}
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2 text-gray-300">Your Look</h2>
                        <div className="bg-black rounded-lg overflow-hidden">
                           <img src={capturedImage} alt="Captured user" className="w-full h-auto max-h-80 object-contain" />
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg flex-grow overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-2 text-gray-300">Style Analysis</h2>
                         <p className="text-gray-400 mb-2 capitalize"><strong className="text-gray-200">For:</strong> {gender} / {occasion}</p>
                        <p className="text-gray-400"><strong className="text-gray-200">Our Take:</strong> {analysis.styleAnalysis}</p>
                    </div>
                </div>

                {/* Right Column: Recommendations Grid */}
                <div className="flex flex-col gap-4 bg-gray-900/50 p-4 rounded-lg min-h-0">
                    <h2 className="text-xl font-semibold text-gray-300 mb-2">Our Recommendations</h2>
                    <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pr-2">
                        {analysis.recommendations.map((item, index) => {
                             const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(`${gender} ${item.itemName}`)}`;
                             const recommendedImageSrc = `data:image/jpeg;base64,${recommendedItemImages[index]}`;
                             return (
                                <div key={index} className="bg-gray-800 p-3 rounded-lg flex flex-col gap-2 transform transition-transform hover:scale-105 hover:bg-gray-700/50">
                                    <div className="bg-black rounded-md overflow-hidden">
                                        <img src={recommendedImageSrc} alt={item.itemName} className="w-full h-32 sm:h-40 object-contain" />
                                    </div>
                                    <h3 className="text-base font-bold text-teal-400 capitalize truncate" title={item.itemName}>{item.itemName}</h3>
                                    <p className="text-xs text-gray-400 flex-grow leading-relaxed">{item.reason}</p>
                                    <a
                                        href={amazonSearchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full text-center text-sm transition-colors"
                                    >
                                        Find on Amazon
                                    </a>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisView;