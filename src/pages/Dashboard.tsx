import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const Dashboard: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "BrandQR Nedir?",
      answer: "BrandQR, restoran ve kafeler için geliştirilmiş, kağıt menü maliyetini sıfırlayan ve müşteri deneyimini dijitalleştiren modern bir QR menü yönetim sistemidir."
    },
    {
      question: "BrandQR Nasıl Çalışır?",
      answer: "Yönetim panelinden ürünlerinizi ve fiyatlarınızı ekledikten sonra size özel oluşturulan QR kodu masalara yerleştirirsiniz. Müşteriler telefon kameralarıyla bu kodu taratarak anında menüye ulaşır."
    },
    {
      question: "BrandQR'nun Avantajları Nelerdir?",
      answer: "Anlık fiyat güncelleme, basım maliyetlerinden tasarruf, hijyenik kullanım, şık arayüz ve kapsamlı marka yönetimi BrandQR'nun temel avantajlarıdır."
    },
    {
      question: "BrandQR'yu Nasıl Kullanabilirim?",
      answer: "Üye olduktan sonra işletme bilgilerinizi girip ürünlerinizi ekleyerek dakikalar içinde dijital menünüzü yayına alabilirsiniz."
    },
    {
      question: "BrandQR Ücretli mi?",
      answer: "BrandQR, farklı işletme ihtiyaçlarına uygun hem ücretsiz başlangıç paketleri hem de gelişmiş özellikler sunan profesyonel abonelik seçeneklerine sahiptir."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
      {/* Karşılama Bölümü */}
      <section className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          BrandQR'ya Hoş Geldiniz
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
          Snip Mu, restoran ve kafeler için modern ve pratik bir çözüm sunar. Kağıt menülere olan ihtiyacı ortadan kaldıran bu yenilik, 
          müşterilere mobil cihazları üzerinden hızlı ve hijyenik bir şekilde menüye erişim imkanı sağlar. İşletmeler menülerini 
          anında güncelleyebilir, yeni ürünler ekleyebilir ve fiyat değişikliklerini anında uygulayabilir. Bu sayede hem müşteri 
          memnuniyetini artırır hem de çevre dostu bir yaklaşım sergiler. QR Menü ile dijital dönüşümün bir parçası olun ve 
          işletmenizin çağdaş yüzünü yansıtın.
        </p>
      </section>

      {/* SSS Bölümü (Dashboard Kartı) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {faqData.map((item, index) => (
            <div key={index} className="group">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-5 flex justify-between items-center hover:bg-blue-50/30 transition-colors text-left"
              >
                <span className={`font-semibold transition-colors ${openIndex === index ? 'text-blue-600' : 'text-gray-700'}`}>
                  {item.question}
                </span>
                {openIndex === index ? (
                  <Minus size={20} className="text-blue-500" />
                ) : (
                  <Plus size={20} className="text-gray-400 group-hover:text-gray-600" />
                )}
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 pb-6 text-gray-500 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hızlı İstatistikler (Dashboard bonusu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-sm font-medium">Aktif Menü Sayısı</p>
          <h3 className="text-3xl font-bold mt-1">12</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium">Toplam Görüntülenme</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-800">1,284</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium">Müşteri Memnuniyeti</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-800">%98</h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;