import React, { useState ,useEffect} from 'react';
import axiosInstance from '../api';
import { FcCurrencyExchange } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
const CurrencyConverter = () => {
    const [fromCurrency, setFromCurrency] = useState('MRU');
    const [toCurrency, setToCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [convertedAmount, setConvertedAmount] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
      const token = localStorage.getItem('token');
      if(!token){
        navigate('/');
      }
    })

    const handleConvert = () => {
        axiosInstance.get(`/convert/${fromCurrency}/${toCurrency}/${amount}`)
            .then(response => {
                setConvertedAmount(response.data.converted_amount);
            })
            .catch(error => {
                console.log(error);
            });
    };

    return (
        <div >
            <div className="counvert rounded-top hidden md:block">
              <h1 className='d-flex justify-content-center font-bold text-indigo-800 pt-5'>Convertisseur de Devises</h1>
            </div>
            <div class="card  md:w-[70%] md:h-[300px] md:border-0 md:absolute md:right-[110px] md:top-[200px] md:shadow-[0_4px_8px_0_rgba(0,0,0,0.2),0_6px_20px_0_rgba(0,0,0,0.19)]">
              <div class="card-header d-flex justify-content-center border-0 ">
                <b className='text-indigo-800 SC'> <FcCurrencyExchange /> Convertir</b>
              </div>
              <div className="row g-3 p-5">
              <div class="col-md-4">
                <label for="validationServer01" class="form-label"><b>Montant</b></label>
                <input min="0"
                  type="number"
                  className="form-control "
                  id="validationServer01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Montant à convertir"
                />
              </div>
              <div class="col-md-4">
                  <label for="validationServer01" class="form-label"><b>De</b></label>
                  <select value={fromCurrency} className="form-control "
                        id="validationServer01" onChange={(e) => setFromCurrency(e.target.value)}>
                      <option value="MRU">MRU</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="SAR">SAR</option>
                  </select>
              </div>
              <div class="col-md-4">
                <label for="validationServer01" class="form-label"><b>À</b></label>
                <select value={toCurrency} className="form-control "
                  id="validationServer01" onChange={(e) => setToCurrency(e.target.value)}>
                  <option value="MRU">MRU</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>

              {convertedAmount && <b>Montant Converti: {convertedAmount} {toCurrency}</b>}
              <button className='btn border-indigo-800 text-indigo-800 btn-sm hover:bg-indigo-500 hover:text-white' onClick={handleConvert}>Convertir</button>

            </div>
          </div>
            
        </div>
    );
};

export default CurrencyConverter;
