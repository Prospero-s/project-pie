import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const FinancialDataViewer = () => {
  const { t, i18n } = useTranslation('board_pack');
  const { t: tCommon } = useTranslation('common');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');
  const [currentProcessingId, setCurrentProcessingId] = useState(null);
  const previousProcessingIdRef = useRef(null);
  const processingIdForCleanup = useRef(null);

  useEffect(() => {
    processingIdForCleanup.current = currentProcessingId;
  }, [currentProcessingId]);

  useEffect(() => {
    const cleanupOnUnmount = () => {
      const idToClean = processingIdForCleanup.current;
      if (idToClean) {
        const url = `http://localhost:5000/cleanup/${idToClean}`;
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, null);
        } else {
          fetch(url, { method: 'POST', keepalive: true }).catch(err =>
            console.error('Erreur cleanup fallback:', err),
          );
        }
      }
    };

    window.addEventListener('beforeunload', cleanupOnUnmount);

    return () => {
      window.removeEventListener('beforeunload', cleanupOnUnmount);
      cleanupOnUnmount();
    };
  }, []);

  const triggerFullCleanup = async () => {
    setError(null);
    setFinancialData(null);
    setImageUrls([]);
    setProcessingStatus('');
    setCurrentProcessingId(null);
    if (document.getElementById('boardPackFile')) {
      document.getElementById('boardPackFile').value = '';
    }

    try {
      await axios.post('http://localhost:5000/cleanup/all');
    } catch (error) {
      console.error('Erreur lors de la demande de nettoyage complet:', error);
    }
  };

  const handleFileChange = event => {
    setFile(event.target.files[0]);
    setError(null);
    setFinancialData(null);
    setImageUrls([]);
    setProcessingStatus('');
    setCurrentProcessingId(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!file) {
      setError(t('no_file_selected'));
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError(t('only_pdf_accepted'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessingStatus(t('uploading'));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', i18n.language);

      setProcessingStatus(t('processing'));

      const response = await axios.post(
        'http://localhost:5000/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const newProcessingId = response.data.processing_id;
      setCurrentProcessingId(newProcessingId);
      previousProcessingIdRef.current = currentProcessingId;

      setFinancialData(response.data.data);
      setImageUrls(response.data.image_urls || []);
      setProcessingStatus(t('completed'));
      if (response.data.processing_warning) {
        setError(
          t('processing_warning_frontend', {
            details: response.data.processing_warning,
          }),
        );
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.response?.data?.error || t('processing_error'));
      setProcessingStatus(t('failed'));
      setImageUrls([]);
      setCurrentProcessingId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    className: 'pdf-page-slider',
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gray-100 px-4 py-3 border-b">
          <h5 className="text-lg font-medium text-gray-900">{t('title')}</h5>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="boardPackFile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('select_file')}
              </label>
              <input
                type="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-primary focus:border-blue-primary"
                id="boardPackFile"
                accept=".pdf"
                onClick={triggerFullCleanup}
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <div className="mt-1 text-sm text-gray-600">{t('file_help')}</div>
            </div>

            <button
              type="submit"
              className="bg-blue-primary text-white px-4 py-2 rounded hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-blue-light focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !file}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {tCommon('processing')}
                </>
              ) : (
                t('process_file')
              )}
            </button>

            {processingStatus && (
              <div className="mt-4">
                <div className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                  {processingStatus}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4">
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {(financialData || imageUrls.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h5 className="text-lg font-medium text-gray-900">
                {t('extracted_data')}
                {financialData?.date ? ` (${financialData.date})` : ''}
              </h5>
            </div>
            <div className="p-4">
              {financialData?.kpis ? (
                <>
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                          >
                            {t('kpi')}
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                          >
                            Q1
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                          >
                            Q2
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                          >
                            Q3
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                          >
                            Q4
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t('total_or_value')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(financialData.kpis).map(
                          ([key, kpiData]) => {
                            if (!kpiData) return null;

                            const label = t(key, { defaultValue: key });

                            const hasQuarterlyData =
                              kpiData.Q1 !== undefined ||
                              kpiData.Q2 !== undefined ||
                              kpiData.Q3 !== undefined ||
                              kpiData.Q4 !== undefined ||
                              kpiData.total_annual !== undefined;
                            const singleValue = kpiData.value;
                            const totalOrAverage =
                              kpiData.total_annual ??
                              kpiData.average_annual ??
                              null;

                            return (
                              <tr key={key} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                                  {label}
                                </td>
                                {hasQuarterlyData ? (
                                  <>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                      {kpiData.Q1 ?? '-'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                      {kpiData.Q2 ?? '-'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                      {kpiData.Q3 ?? '-'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                      {kpiData.Q4 ?? '-'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                                      {totalOrAverage ?? t('not_available')}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                      -
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                      -
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                      -
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                      -
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                                      {singleValue ?? t('not_available')}
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>

                  {financialData.autres_indicateurs &&
                    Object.keys(financialData.autres_indicateurs).length >
                      0 && (
                      <div>
                        <h6 className="text-md font-medium text-gray-800 mb-2">
                          {t('other_indicators_summary')}
                        </h6>

                        {financialData.autres_indicateurs.summary && (
                          <div className="p-3 bg-gray-50 rounded border mb-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {financialData.autres_indicateurs.summary}
                            </p>
                          </div>
                        )}

                        {financialData.autres_indicateurs.tables &&
                          financialData.autres_indicateurs.tables.length >
                            0 && (
                            <div className="mb-4">
                              <h6 className="text-md font-medium text-gray-800 mb-2">
                                {t('summary_tables')}
                              </h6>
                              <ul className="list-disc list-inside space-y-2">
                                {financialData.autres_indicateurs.tables.map(
                                  (table, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-gray-700"
                                    >
                                      <strong>
                                        {table.title || t('unnamed_table')}:
                                      </strong>{' '}
                                      {table.summary ||
                                        t('no_summary_available')}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                                >
                                  {t('indicator')}
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                                >
                                  Q1
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                                >
                                  Q2
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                                >
                                  Q3
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                                >
                                  Q4
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {t('total_or_value')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(financialData.autres_indicateurs)
                                .filter(
                                  ([key]) =>
                                    key !== 'summary' && key !== 'tables',
                                )
                                .map(([key, kpiData]) => {
                                  if (!kpiData || typeof kpiData !== 'object')
                                    return null;

                                  const label = t(key, { defaultValue: key });
                                  const hasQuarterlyData =
                                    kpiData.Q1 !== undefined ||
                                    kpiData.Q2 !== undefined ||
                                    kpiData.Q3 !== undefined ||
                                    kpiData.Q4 !== undefined ||
                                    kpiData.total_annual !== undefined;
                                  const singleValue = kpiData.value;
                                  const totalOrAverage =
                                    kpiData.total_annual ??
                                    kpiData.average_annual ??
                                    null;

                                  return (
                                    <tr key={key} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                                        {label}
                                      </td>
                                      {hasQuarterlyData ? (
                                        <>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                            {kpiData.Q1 ?? '-'}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                            {kpiData.Q2 ?? '-'}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                            {kpiData.Q3 ?? '-'}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                            {kpiData.Q4 ?? '-'}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                                            {totalOrAverage ??
                                              t('not_available')}
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                            -
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                            -
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                            -
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-400 text-center border-r">
                                            -
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                                            {singleValue ?? t('not_available')}
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('no_data_extracted')}
                </p>
              )}
            </div>
          </div>

          {imageUrls.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b">
                <h5 className="text-lg font-medium text-gray-900">
                  {t('document_preview')} ({imageUrls.length} {t('pages')})
                </h5>
              </div>
              <div
                className="p-4 pdf-slider-container"
                style={{ maxHeight: '80vh', overflow: 'hidden' }}
              >
                <Slider {...sliderSettings}>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="pdf-page">
                      <img
                        src={url}
                        alt={`Page ${index + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialDataViewer;
