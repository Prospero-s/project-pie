import React, { useState, useEffect } from 'react';
import { Form, Select, Spin } from 'antd';
import axios from 'axios';

const InvestorSelection = ({ value, onChange, t }) => {
    const [groupMembers, setGroupMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGroupMembers();
    }, []);

    const loadGroupMembers = async () => {
        try {
            const response = await axios.get('/api/user-groups');
            if (response.data.groups && response.data.groups.length > 0) {
                const currentGroup = response.data.groups[0];
                setGroupMembers(currentGroup.members);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading group members:', error);
            setLoading(false);
        }
    };

    return (
        <Form.Item
            name="investorId"
            label={t('investor')}
            rules={[{ required: true, message: t('investorRequired') }]}
        >
            <Select
                loading={loading}
                placeholder={t('selectInvestor')}
                className="w-full"
                notFoundContent={loading ? <Spin size="small" /> : null}
            >
                {groupMembers.map((member) => (
                    <Select.Option key={member.id} value={member.id}>
                        {member.email}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    );
};

export default InvestorSelection; 