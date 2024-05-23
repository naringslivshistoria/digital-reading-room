import { createSearchQuery } from '../queryFunctions'
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types'

describe('queryFunctions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('createSearchQuery', () => {
    it("Creates a correct search query for series without ' - ' in the seriesName", () => {
      const queryString = undefined
      const accessFilter = [
        {
          terms: {
            'fields.depositor.value.keyword': [
              'Centrum för Näringslivshistoria',
              'ICA AB',
              'Bonnierförlagen AB',
              'Scandinavian Institutes for Administrative Research (SIAR)',
            ],
          },
        },
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': [
                          'Föreningen Stockholms Företagsminnen',
                        ],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Bazarbolaget',
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': ['Berns Salonger'],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Berns Restauranter',
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': ['Berns Salonger'],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Berns Restauranter',
                        ],
                      },
                    },
                    {
                      terms: {
                        'fields.seriesName.value.keyword': [
                          'Digitaliserade och detaljregistrerade handlingar',
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': ['Berns Salonger'],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Berns Restauranter',
                        ],
                      },
                    },
                    {
                      terms: {
                        'fields.seriesName.value.keyword': [
                          'Musikprogram 1912-1917',
                        ],
                      },
                    },
                    { terms: { 'fields.volume.value.keyword': ['4'] } },
                  ],
                },
              },
            ],
          },
        },
      ]
      const filterString =
        'depositor::Berns Salonger||archiveInitiator::Berns Restauranter||seriesName::F 2 c - Musikprogram 1912-1917'
      const query = createSearchQuery(
        queryString,
        accessFilter as Array<QueryDslQueryContainer>,
        filterString
      )
      expect(query).toEqual({
        bool: {
          must: [
            { terms: { 'fields.depositor.value.keyword': ['Berns Salonger'] } },
            {
              terms: {
                'fields.archiveInitiator.value.keyword': ['Berns Restauranter'],
              },
            },
            {
              terms: {
                'fields.seriesName.value.keyword': ['Musikprogram 1912-1917'],
              },
            },
          ],
          filter: {
            bool: {
              should: [
                {
                  terms: {
                    'fields.depositor.value.keyword': [
                      'Centrum för Näringslivshistoria',
                      'ICA AB',
                      'Bonnierförlagen AB',
                      'Scandinavian Institutes for Administrative Research (SIAR)',
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Föreningen Stockholms Företagsminnen',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Bazarbolaget',
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Berns Salonger',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Berns Restauranter',
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Berns Salonger',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Berns Restauranter',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.seriesName.value.keyword': [
                                  'Digitaliserade och detaljregistrerade handlingar',
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Berns Salonger',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Berns Restauranter',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.seriesName.value.keyword': [
                                  'Musikprogram 1912-1917',
                                ],
                              },
                            },
                            { terms: { 'fields.volume.value.keyword': ['4'] } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
    })

    it("Creates a correct search query for series with ' - ' in the seriesName", () => {
      const queryString = undefined
      const accessFilter = [
        {
          terms: {
            'fields.depositor.value.keyword': [
              'Centrum för Näringslivshistoria',
              'ICA AB',
              'Bonnierförlagen AB',
              'Scandinavian Institutes for Administrative Research (SIAR)',
            ],
          },
        },
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': [
                          'Föreningen Stockholms Företagsminnen',
                        ],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Bazarbolaget',
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': ['Berns Salonger'],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Berns Restauranter',
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': ['Berns Salonger'],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Berns Restauranter',
                        ],
                      },
                    },
                    {
                      terms: {
                        'fields.seriesName.value.keyword': [
                          'Digitaliserade och detaljregistrerade handlingar',
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        'fields.depositor.value.keyword': ['Berns Salonger'],
                      },
                    },
                    {
                      terms: {
                        'fields.archiveInitiator.value.keyword': [
                          'Berns Restauranter',
                        ],
                      },
                    },
                    {
                      terms: {
                        'fields.seriesName.value.keyword': [
                          'Musikprogram 1912-1917',
                        ],
                      },
                    },
                    { terms: { 'fields.volume.value.keyword': ['4'] } },
                  ],
                },
              },
            ],
          },
        },
      ]
      const filterString =
        'depositor::Scandinavian Institutes for Administrative Research (SIAR)||archiveInitiator::Scandinavian Institutes for Administrative Research (SIAR)||seriesName::F 1 bi - Utrednings-PM (UPM) - I%%F 1 bh - Utrednings-PM (UPM) - H%%F 1 bg - Utrednings-PM (UPM) - G'
      const query = createSearchQuery(
        queryString,
        accessFilter as Array<QueryDslQueryContainer>,
        filterString
      )
      expect(query).toEqual({
        bool: {
          must: [
            {
              terms: {
                'fields.depositor.value.keyword': [
                  'Scandinavian Institutes for Administrative Research (SIAR)',
                ],
              },
            },
            {
              terms: {
                'fields.archiveInitiator.value.keyword': [
                  'Scandinavian Institutes for Administrative Research (SIAR)',
                ],
              },
            },
            {
              terms: {
                'fields.seriesName.value.keyword': [
                  'Utrednings-PM (UPM) - I',
                  'Utrednings-PM (UPM) - H',
                  'Utrednings-PM (UPM) - G',
                ],
              },
            },
          ],
          filter: {
            bool: {
              should: [
                {
                  terms: {
                    'fields.depositor.value.keyword': [
                      'Centrum för Näringslivshistoria',
                      'ICA AB',
                      'Bonnierförlagen AB',
                      'Scandinavian Institutes for Administrative Research (SIAR)',
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Föreningen Stockholms Företagsminnen',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Bazarbolaget',
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Berns Salonger',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Berns Restauranter',
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Berns Salonger',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Berns Restauranter',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.seriesName.value.keyword': [
                                  'Digitaliserade och detaljregistrerade handlingar',
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              terms: {
                                'fields.depositor.value.keyword': [
                                  'Berns Salonger',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.archiveInitiator.value.keyword': [
                                  'Berns Restauranter',
                                ],
                              },
                            },
                            {
                              terms: {
                                'fields.seriesName.value.keyword': [
                                  'Musikprogram 1912-1917',
                                ],
                              },
                            },
                            {
                              terms: { 'fields.volume.value.keyword': ['4'] },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
    })
  })
})
